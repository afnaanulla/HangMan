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
exports.RoomController = void 0;
const common_1 = require("@nestjs/common");
const room_service_1 = require("./room.service");
const room_dto_1 = require("./dto/room.dto");
const jwt_guard_1 = require("../auth/guard/jwt.guard");
const game_gateway_1 = require("./game.gateway");
const swagger_1 = require("@nestjs/swagger");
let RoomController = class RoomController {
    roomService;
    gameGateway;
    constructor(roomService, gameGateway) {
        this.roomService = roomService;
        this.gameGateway = gameGateway;
    }
    createRoom(req, dto) {
        return this.roomService.createRoom(req.user.id, dto);
    }
    getRooms() {
        return this.roomService.getRooms();
    }
    getRoom(req, roomId) {
        return this.roomService.getRoom(req.user.id, roomId);
    }
    joinRoom(req, roomId, dto) {
        return this.roomService.joinRoom(req.user.id, roomId, dto);
    }
    leaveRoom(req, roomId) {
        return this.roomService.leaveRoom(req.user.id, roomId);
    }
    async deleteRoom(req, roomId) {
        const result = await this.roomService.deleteRoom(req.user.id, roomId);
        this.gameGateway.notifyRoomDeleted(roomId);
        this.gameGateway.broadcastRoomList();
        return result;
    }
    async kickUser(req, roomId, userIdToKick) {
        const result = await this.roomService.kickUser(req.user.id, roomId, userIdToKick);
        this.gameGateway.notifyKicked(roomId, userIdToKick);
        this.gameGateway.broadcastRoomList();
        return result;
    }
};
exports.RoomController = RoomController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new game room' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, room_dto_1.CreateRoomDto]),
    __metadata("design:returntype", void 0)
], RoomController.prototype, "createRoom", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all active rooms' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RoomController.prototype, "getRooms", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get details of a specific room' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RoomController.prototype, "getRoom", null);
__decorate([
    (0, common_1.Post)(':id/join'),
    (0, swagger_1.ApiOperation)({ summary: 'Join an existing room' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, room_dto_1.JoinRoomDto]),
    __metadata("design:returntype", void 0)
], RoomController.prototype, "joinRoom", null);
__decorate([
    (0, common_1.Delete)(':id/leave'),
    (0, swagger_1.ApiOperation)({ summary: 'Leave a room' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RoomController.prototype, "leaveRoom", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a room (Creator only)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "deleteRoom", null);
__decorate([
    (0, common_1.Patch)(':id/kick/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Kick a user from the room (Creator only)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "kickUser", null);
exports.RoomController = RoomController = __decorate([
    (0, swagger_1.ApiTags)('rooms'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Controller)('rooms'),
    __metadata("design:paramtypes", [room_service_1.RoomService,
        game_gateway_1.GameGateway])
], RoomController);
//# sourceMappingURL=room.controller.js.map