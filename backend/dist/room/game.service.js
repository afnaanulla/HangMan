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
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const hangman_words_1 = require("./hangman-words");
const game_gateway_1 = require("./game.gateway");
const game_status_enum_1 = require("./enums/game-status.enum");
const game_formatter_1 = require("./utils/game-formatter");
let GameService = class GameService {
    prisma;
    gateway;
    constructor(prisma, gateway) {
        this.prisma = prisma;
        this.gateway = gateway;
    }
    async startGame(userId, roomId) {
        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            include: { members: true },
        });
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        if (room.creatorId !== userId) {
            throw new common_1.ForbiddenException('Only the creator can start the game');
        }
        if (room.members.length < 2) {
            throw new common_1.BadRequestException('At least 2 players are required to start');
        }
        const { word, hint } = hangman_words_1.HANGMAN_WORDS[Math.floor(Math.random() * hangman_words_1.HANGMAN_WORDS.length)];
        const gameState = await this.prisma.gameState.upsert({
            where: { roomId },
            update: {
                word: word.toLowerCase(),
                hint,
                guessedLetters: [],
                incorrectGuesses: 0,
                turnUserId: room.members[0].id,
                status: game_status_enum_1.GameStatus.PLAYING,
            },
            create: {
                roomId,
                word: word.toLowerCase(),
                hint,
                guessedLetters: [],
                turnUserId: room.members[0].id,
                status: game_status_enum_1.GameStatus.PLAYING,
            },
        });
        this.gateway.broadcastGameState(roomId, (0, game_formatter_1.formatGameState)(gameState));
        return gameState;
    }
    async makeGuess(userId, roomId, letter) {
        const gameState = await this.prisma.gameState.findUnique({
            where: { roomId },
            include: { room: { include: { members: true } } },
        });
        if (!gameState || gameState.status !== game_status_enum_1.GameStatus.PLAYING) {
            throw new common_1.BadRequestException('Game not in progress');
        }
        if (gameState.turnUserId !== userId) {
            throw new common_1.ForbiddenException('Not your turn');
        }
        const guess = letter.toLowerCase();
        if (gameState.guessedLetters.includes(guess)) {
            throw new common_1.BadRequestException('Letter already guessed');
        }
        const isCorrect = gameState.word.includes(guess);
        const updatedGuessedLetters = [...gameState.guessedLetters, guess];
        let updatedIncorrectGuesses = gameState.incorrectGuesses;
        if (!isCorrect)
            updatedIncorrectGuesses++;
        const members = gameState.room.members;
        const currentIndex = members.findIndex((m) => m.id === userId);
        const nextIndex = (currentIndex + 1) % members.length;
        const nextUserId = members[nextIndex].id;
        let status = game_status_enum_1.GameStatus.PLAYING;
        const isWon = gameState.word.split('').every((l) => updatedGuessedLetters.includes(l));
        if (isWon) {
            status = game_status_enum_1.GameStatus.WON;
            await this.prisma.user.update({
                where: { id: userId },
                data: { score: { increment: 10 } },
            });
            await this.gateway.updateRoomMembers(roomId);
        }
        else if (updatedIncorrectGuesses >= gameState.maxIncorrect) {
            status = game_status_enum_1.GameStatus.LOST;
        }
        const updatedGameState = await this.prisma.gameState.update({
            where: { roomId },
            data: {
                guessedLetters: updatedGuessedLetters,
                incorrectGuesses: updatedIncorrectGuesses,
                turnUserId: nextUserId,
                status,
            },
        });
        this.gateway.broadcastGameState(roomId, (0, game_formatter_1.formatGameState)(updatedGameState));
        return updatedGameState;
    }
};
exports.GameService = GameService;
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        game_gateway_1.GameGateway])
], GameService);
//# sourceMappingURL=game.service.js.map