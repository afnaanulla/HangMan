import { GameStatus } from '../enums/game-status.enum';

export function formatGameState(gameState: any) {
  const isOver = gameState.status === GameStatus.WON || gameState.status === GameStatus.LOST;
  
  // Reveal all letters if game is over, otherwise only guessed ones
  const displayWord = gameState.word
    .split('')
    .map((l: string) => {
      if (l === ' ') return ' ';
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
