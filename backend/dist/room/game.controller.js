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
exports.GameController = void 0;
const common_1 = require("@nestjs/common");
const game_service_1 = require("./game.service");
const jwt_guard_1 = require("../auth/guard/jwt.guard");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class GuessDto {
    letter;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'a' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 1),
    __metadata("design:type", String)
], GuessDto.prototype, "letter", void 0);
let GameController = class GameController {
    gameService;
    constructor(gameService) {
        this.gameService = gameService;
    }
    startGame(req, roomId) {
        return this.gameService.startGame(req.user.id, roomId);
    }
    makeGuess(req, roomId, dto) {
        return this.gameService.makeGuess(req.user.id, roomId, dto.letter);
    }
};
exports.GameController = GameController;
__decorate([
    (0, common_1.Post)('start'),
    (0, swagger_1.ApiOperation)({ summary: 'Start a new game (Creator only)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('roomId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "startGame", null);
__decorate([
    (0, common_1.Post)('guess'),
    (0, swagger_1.ApiOperation)({ summary: 'Make a letter guess' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('roomId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, GuessDto]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "makeGuess", null);
exports.GameController = GameController = __decorate([
    (0, swagger_1.ApiTags)('game'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Controller)('rooms/:roomId/game'),
    __metadata("design:paramtypes", [game_service_1.GameService])
], GameController);
//# sourceMappingURL=game.controller.js.map