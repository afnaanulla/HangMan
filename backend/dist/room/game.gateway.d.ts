import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { RoomService } from './room.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private prisma;
    private roomService;
    server: Server;
    constructor(jwtService: JwtService, prisma: PrismaService, roomService: RoomService);
    private userRooms;
    handleConnection(client: Socket): Promise<Socket<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any> | undefined>;
    handleDisconnect(client: Socket): Promise<void>;
    handleJoinRoom(client: Socket, roomId: string): Promise<void>;
    handleLeaveRoom(client: Socket, roomId: string): Promise<void>;
    updateRoomMembers(roomId: string): Promise<void>;
    notifyKicked(roomId: string, userId: string): void;
    notifyRoomDeleted(roomId: string): void;
    broadcastGameState(roomId: string, gameState: any): void;
    broadcastRoomList(): Promise<void>;
}
