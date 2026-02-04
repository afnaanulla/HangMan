"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatGameState = formatGameState;
const game_status_enum_1 = require("../enums/game-status.enum");
function formatGameState(gameState) {
    const isOver = gameState.status === game_status_enum_1.GameStatus.WON || gameState.status === game_status_enum_1.GameStatus.LOST;
    const displayWord = gameState.word
        .split('')
        .map((l) => {
        if (l === ' ')
            return ' ';
        return (isOver || gameState.guessedLetters.includes(l.toLowerCase())) ? l : '_';
    })
        .join(' ');
    return {
        displayWord,
        hint: gameState.hint,
        incorrectGuessesRemaining: (gameState.maxIncorrect || 6) - gameState.incorrectGuesses,
        turnUserId: gameState.turnUserId,
        status: gameState.status,
        guessedLetters: gameState.guessedLetters,
    };
}
//# sourceMappingURL=game-formatter.js.map