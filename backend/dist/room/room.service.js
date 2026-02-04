"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const game_formatter_1 = require("./utils/game-formatter");
let RoomService = class RoomService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRoom(userId, dto) {
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
    async getRoom(userId, roomId) {
        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            include: {
                members: { select: { id: true, username: true, score: true } },
                gameState: true,
            },
        });
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        const isMember = room.members.some(m => m.id === userId);
        if (!isMember && room.creatorId !== userId) {
            throw new common_1.ForbiddenException('You must be a member to view room details');
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
    async joinRoom(userId, roomId, dto) {
        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            include: { members: true },
        });
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        if (room.password && room.password !== dto.password) {
            throw new common_1.ForbiddenException('Invalid room password');
        }
        if (room.members.length >= room.playerLimit) {
            throw new common_1.BadRequestException('Room is full');
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
    mapRoom(room) {
        const { password, ...rest } = room;
        if (rest.gameState) {
            rest.gameState = (0, game_formatter_1.formatGameState)(rest.gameState);
        }
        return { ...rest, hasPassword: !!password };
    }
    async leaveRoom(userId, roomId) {
        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            include: { members: { select: { id: true } } },
        });
        if (!room)
            return;
        const isMember = room.members.some((m) => m.id === userId);
        if (!isMember)
            return;
        return this.prisma.room.update({
            where: { id: roomId },
            data: {
                members: {
                    disconnect: { id: userId },
                },
            },
        });
    }
    async deleteRoom(userId, roomId) {
        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
        });
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        if (room.creatorId !== userId) {
            throw new common_1.ForbiddenException('Only the creator can delete the room');
        }
        return this.prisma.room.delete({
            where: { id: roomId },
        });
    }
    async kickUser(creatorId, roomId, userIdToKick) {
        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
        });
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        if (room.creatorId !== creatorId) {
            throw new common_1.ForbiddenException('Only the creator can kick users');
        }
        if (creatorId === userIdToKick) {
            throw new common_1.BadRequestException('You cannot kick yourself');
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
};
exports.RoomService = RoomService;
exports.RoomService = RoomService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoomService);
//# sourceMappingURL=room.service.js.map