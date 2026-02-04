import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HANGMAN_WORDS } from './hangman-words';
import { GameGateway } from './game.gateway';
import { GameStatus } from './enums/game-status.enum';
import { formatGameState } from './utils/game-formatter';

@Injectable()
export class GameService {
  constructor(
    private prisma: PrismaService,
    private gateway: GameGateway,
  ) {}

  async startGame(userId: string, roomId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { members: true },
    });

    if (!room) throw new NotFoundException('Room not found');
    if (room.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can start the game');
    }
    if (room.members.length < 2) {
      throw new BadRequestException('At least 2 players are required to start');
    }

    const { word, hint } = HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)];

    const gameState = await this.prisma.gameState.upsert({
      where: { roomId },
      update: {
        word: word.toLowerCase(),
        hint,
        guessedLetters: [],
        incorrectGuesses: 0,
        turnUserId: room.members[0].id, // First player starts
        status: GameStatus.PLAYING,
      },
      create: {
        roomId,
        word: word.toLowerCase(),
        hint,
        guessedLetters: [],
        turnUserId: room.members[0].id,
        status: GameStatus.PLAYING,
      },
    });

    this.gateway.broadcastGameState(roomId, formatGameState(gameState));
    return gameState;
  }

  async makeGuess(userId: string, roomId: string, letter: string) {
    const gameState = await this.prisma.gameState.findUnique({
      where: { roomId },
      include: { room: { include: { members: true } } },
    });

    if (!gameState || gameState.status !== GameStatus.PLAYING) {
      throw new BadRequestException('Game not in progress');
    }
    if (gameState.turnUserId !== userId) {
      throw new ForbiddenException('Not your turn');
    }

    const guess = letter.toLowerCase();
    if (gameState.guessedLetters.includes(guess)) {
      throw new BadRequestException('Letter already guessed');
    }

    const isCorrect = gameState.word.includes(guess);
    const updatedGuessedLetters = [...gameState.guessedLetters, guess];
    let updatedIncorrectGuesses = gameState.incorrectGuesses;
    if (!isCorrect) updatedIncorrectGuesses++;

    // Determine next turn
    const members = gameState.room.members;
    const currentIndex = members.findIndex((m) => m.id === userId);
    const nextIndex = (currentIndex + 1) % members.length;
    const nextUserId = members[nextIndex].id;

    // Check Win/Loss
    let status: GameStatus = GameStatus.PLAYING;
    const isWon = gameState.word.split('').every((l) => updatedGuessedLetters.includes(l));
    if (isWon) {
      status = GameStatus.WON;
      // Bonus: Reward players?
      await this.prisma.user.update({
        where: { id: userId },
        data: { score: { increment: 10 } },
      });
      await this.gateway.updateRoomMembers(roomId);
    } else if (updatedIncorrectGuesses >= gameState.maxIncorrect) {
      status = GameStatus.LOST;
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

    this.gateway.broadcastGameState(roomId, formatGameState(updatedGameState));
    return updatedGameState;
  }
}
