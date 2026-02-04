export interface User {
  id: string;
  username: string;
  score: number;
}

export interface Room {
  id: string;
  name: string;
  playerLimit: number;
  creatorId: string;
  hasPassword: boolean;
  _count?: {
    members: number;
  };
  members?: User[];
}

export interface GameState {
  displayWord: string;
  hint: string;
  incorrectGuessesRemaining: number;
  turnUserId: string;
  status: 'WAITING' | 'PLAYING' | 'WON' | 'LOST';
  guessedLetters: string[];
}
