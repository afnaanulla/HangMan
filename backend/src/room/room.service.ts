import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto, JoinRoomDto } from './dto/room.dto';
import { formatGameState } from './utils/game-formatter';

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  async createRoom(userId: string, dto: CreateRoomDto) {
    const room = await this.prisma.room.create({
      data: {
        name: dto.name,
        password: dto.password,
        playerLimit: dto.playerLimit,
        creatorId: userId,
        members: {
          connect: { id: userId },
        },
      },
      include: {
        members: {
          select: { id: true, username: true, score: true },
        },
      },
    });
    return this.mapRoom(room);
  }

  async getRoom(userId: string, roomId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: { select: { id: true, username: true, score: true } },
        gameState: true,
      },
    });

    if (!room) throw new NotFoundException('Room not found');

    const isMember = room.members.some(m => m.id === userId);
    if (!isMember && room.creatorId !== userId) {
      throw new ForbiddenException('You must be a member to view room details');
    }

    return this.mapRoom(room);
  }

  async getRooms() {
    const rooms = await this.prisma.room.findMany({
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    return rooms.map(room => this.mapRoom(room));
  }

  async joinRoom(userId: string, roomId: string, dto: JoinRoomDto) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { members: true },
    });

    if (!room) throw new NotFoundException('Room not found');
    if (room.password && room.password !== dto.password) {
      throw new ForbiddenException('Invalid room password');
    }
    if (room.members.length >= room.playerLimit) {
      throw new BadRequestException('Room is full');
    }

    const updatedRoom = await this.prisma.room.update({
      where: { id: roomId },
      data: {
        members: {
          connect: { id: userId },
        },
      },
      include: {
        members: {
          select: { id: true, username: true, score: true },
        },
      },
    });
    return this.mapRoom(updatedRoom);
  }

  private mapRoom(room: any) {
    const { password, ...rest } = room;
    if (rest.gameState) {
      rest.gameState = formatGameState(rest.gameState);
    }
    return { ...rest, hasPassword: !!password };
  }

  async leaveRoom(userId: string, roomId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { members: { select: { id: true } } },
    });

    if (!room) return; // Room already gone, nothing to do

    const isMember = room.members.some((m) => m.id === userId);
    if (!isMember) return; // User already left, avoid P2025 error

    return this.prisma.room.update({
      where: { id: roomId },
      data: {
        members: {
          disconnect: { id: userId },
        },
      },
    });
  }

  async deleteRoom(userId: string, roomId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) throw new NotFoundException('Room not found');
    if (room.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can delete the room');
    }

    return this.prisma.room.delete({
      where: { id: roomId },
    });
  }

  async kickUser(creatorId: string, roomId: string, userIdToKick: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) throw new NotFoundException('Room not found');
    if (room.creatorId !== creatorId) {
      throw new ForbiddenException('Only the creator can kick users');
    }
    if (creatorId === userIdToKick) {
      throw new BadRequestException('You cannot kick yourself');
    }

    return this.prisma.room.update({
      where: { id: roomId },
      data: {
        members: {
          disconnect: { id: userIdToKick },
        },
      },
      include: {
        members: {
          select: { id: true, username: true, score: true },
        },
      },
    });
  }
}
