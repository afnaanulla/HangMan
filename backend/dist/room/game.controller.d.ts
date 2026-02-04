import { GameService } from './game.service';
declare class GuessDto {
    letter: string;
}
export declare class GameController {
    private gameService;
    constructor(gameService: GameService);
    startGame(req: any, roomId: string): Promise<{
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
    makeGuess(req: any, roomId: string, dto: GuessDto): Promise<{
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
export {};
