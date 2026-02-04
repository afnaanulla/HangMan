import { PrismaService } from '../prisma/prisma.service';
import { GameGateway } from './game.gateway';
export declare class GameService {
    private prisma;
    private gateway;
    constructor(prisma: PrismaService, gateway: GameGateway);
    startGame(userId: string, roomId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        roomId: string;
        word: string;
        hint: string;
        guessedLetters: string[];
        incorrectGuesses: number;
        maxIncorrect: number;
        turnUserId: string;
        status: import(".prisma/client").$Enums.GameStatus;
    }>;
    makeGuess(userId: string, roomId: string, letter: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        roomId: string;
        word: string;
        hint: string;
        guessedLetters: string[];
        incorrectGuesses: number;
        maxIncorrect: number;
        turnUserId: string;
        status: import(".prisma/client").$Enums.GameStatus;
    }>;
}
