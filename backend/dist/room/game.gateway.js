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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const room_service_1 = require("./room.service");
const prisma_service_1 = require("../prisma/prisma.service");
const game_formatter_1 = require("./utils/game-formatter");
let GameGateway = class GameGateway {
    jwtService;
    prisma;
    roomService;
    server;
    constructor(jwtService, prisma, roomService) {
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.roomService = roomService;
    }
    userRooms = new Map();
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token?.split(' ')[1];
            if (!token)
                return client.disconnect();
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET,
            });
            client.data.userId = payload.sub;
            client.data.username = payload.username;
            console.log(`[Socket] User connected: ${payload.username} (${client.id})`);
        }
        catch (e) {
            console.error(`[Socket] Connection failed: ${e.message}`);
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
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
    async handleJoinRoom(client, roomId) {
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
                this.server.to(client.id).emit('gameStateUpdate', (0, game_formatter_1.formatGameState)(room.gameState));
            }
            this.broadcastRoomList();
        }
    }
    async handleLeaveRoom(client, roomId) {
        const userId = client.data.userId;
        client.leave(roomId);
        this.userRooms.delete(userId);
        await this.roomService.leaveRoom(userId, roomId);
        this.updateRoomMembers(roomId);
        this.broadcastRoomList();
    }
    async updateRoomMembers(roomId) {
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
    notifyKicked(roomId, userId) {
        this.server.to(roomId).emit('userKicked', { userId });
        this.updateRoomMembers(roomId);
    }
    notifyRoomDeleted(roomId) {
        this.server.to(roomId).emit('roomDeleted', { roomId });
        this.server.in(roomId).socketsLeave(roomId);
    }
    broadcastGameState(roomId, gameState) {
        this.server.to(roomId).emit('gameStateUpdate', gameState);
    }
    async broadcastRoomList() {
        const rooms = await this.roomService.getRooms();
        this.server.emit('roomListUpdate', rooms);
    }
};
exports.GameGateway = GameGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GameGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleLeaveRoom", null);
exports.GameGateway = GameGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService,
        room_service_1.RoomService])
], GameGateway);
//# sourceMappingURL=game.gateway.js.map