import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { RoomService } from './room.service';
import { PrismaService } from '../prisma/prisma.service';
import { formatGameState } from './utils/game-formatter';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private roomService: RoomService,
  ) {}

  private userRooms = new Map<string, string>(); // userId -> roomId

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token?.split(' ')[1];
      if (!token) return client.disconnect();

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      client.data.userId = payload.sub;
      client.data.username = payload.username;
      
      console.log(`[Socket] User connected: ${payload.username} (${client.id})`);
    } catch (e) {
      console.error(`[Socket] Connection failed: ${e.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    const roomId = this.userRooms.get(userId);
    
    console.log(`[Socket] User disconnected: ${client.data.username || client.id} (was in room: ${roomId || 'none'})`);
    
    if (roomId && userId) {
      await this.roomService.leaveRoom(userId, roomId);
      this.userRooms.delete(userId);
      this.updateRoomMembers(roomId);
      this.broadcastRoomList();
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    client.join(roomId);
    this.userRooms.set(client.data.userId, roomId);

    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: { select: { id: true, username: true, score: true } },
        gameState: true,
      },
    });

    if (room) {
      this.server.to(roomId).emit('memberListUpdate', {
        members: room.members,
        count: room.members.length,
      });

      if (room.gameState) {
        this.server.to(client.id).emit('gameStateUpdate', formatGameState(room.gameState));
      }
      
      this.broadcastRoomList();
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    const userId = client.data.userId;
    client.leave(roomId);
    this.userRooms.delete(userId);
    await this.roomService.leaveRoom(userId, roomId);
    this.updateRoomMembers(roomId);
    this.broadcastRoomList();
  }

  async updateRoomMembers(roomId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: { select: { id: true, username: true, score: true } },
      },
    });
    if (room) {
      this.server.to(roomId).emit('memberListUpdate', {
        members: room.members,
        count: room.members.length,
      });
    }
  }

  // Notifies a specific user that they have been kicked
  notifyKicked(roomId: string, userId: string) {
    this.server.to(roomId).emit('userKicked', { userId });
    this.updateRoomMembers(roomId);
  }

  // Notifies all members that the room has been deleted
  notifyRoomDeleted(roomId: string) {
    this.server.to(roomId).emit('roomDeleted', { roomId });
    this.server.in(roomId).socketsLeave(roomId);
  }

  broadcastGameState(roomId: string, gameState: any) {
    this.server.to(roomId).emit('gameStateUpdate', gameState);
  }

  async broadcastRoomList() {
    const rooms = await this.roomService.getRooms();
    this.server.emit('roomListUpdate', rooms);
  }
}
