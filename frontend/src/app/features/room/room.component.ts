import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../../core/services/socket.service';
import { RoomService } from '../../core/services/room.service';
import { AuthService } from '../../core/services/auth.service';
import { Room, GameState, User } from '../../core/models/game.models';
import { HangmanDrawingComponent } from './hangman-drawing.component';
import { Subscription } from 'rxjs';
import { GAME_CONSTANTS } from '../../core/constants/game.constants';
import { GameStatus } from '../../core/enums/game.enums';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule, HangmanDrawingComponent],
  template: `
    <div class="room-page animate-fade-in">
      <aside class="side-panel">
        <div class="panel-header">
          <h3>PLAYERS</h3>
          <span class="count">{{ members().length }}</span>
        </div>
        <ul class="player-list">
          <li *ngFor="let member of members(); let i = index" class="player-item" [style.background-color]="getPlayerColor(i)">
            <div class="player-avatar">{{ member.username[0] | uppercase }}</div>
            <div class="player-info">
              <span class="name">{{ member.username }}</span>
              <span class="score">{{ member.score }} PTS</span>
            </div>
            <span *ngIf="member.id === currentRoom()?.creatorId" class="badge-host">HOST</span>
            <button *ngIf="isHost() && member.id !== currentUserId()" (click)="kickUser(member.id)" class="btn-kick">×</button>
          </li>
        </ul>
        
        <div class="panel-footer">
          <button *ngIf="isHost()" (click)="deleteRoom()" class="btn-danger-outline">DELETE MATCH</button>
          <button (click)="leaveRoom()" class="btn-outline">EXIT LOBBY</button>
        </div>
      </aside>

      <main class="game-area">
        <header class="game-header">
          <div class="room-meta">
            <h2>{{ currentRoom()?.name || 'INITIALIZING...' }}</h2>
            <p class="turn-indicator" *ngIf="gameState()?.status === gameStatus.PLAYING">
              CURRENT TURN: <span>{{ getCurrentTurnUsername() }}</span>
            </p>
          </div>
          <div class="game-stats" *ngIf="gameState()">
            <div class="stat">
              <span>HINT PROVIDED</span>
              <strong>{{ gameState()?.hint }}</strong>
            </div>
            <div class="stat">
              <span>MISTAKES</span>
              <strong [class.critical]="(maxMistakes - (gameState()?.incorrectGuessesRemaining || 0)) >= 4">
                {{ maxMistakes - (gameState()?.incorrectGuessesRemaining || 0) }} / {{ maxMistakes }}
              </strong>
            </div>
          </div>
        </header>

        <section class="game-view">
          <div class="canvas-container">
            <app-hangman-drawing [incorrectGuesses]="gameState() ? (maxMistakes - (gameState()?.incorrectGuessesRemaining || 0)) : 0"></app-hangman-drawing>
          </div>
          
          <div class="word-reveal" [class.won]="gameState()?.status === 'WON'" [class.lost]="gameState()?.status === 'LOST'">
            {{ gameState()?.displayWord || '_ _ _ _' }}
          </div>

          <div *ngIf="!gameState() || gameState()?.status === gameStatus.WAITING" class="waiting-zone">
            <p *ngIf="members().length < GAME_CONSTANTS.MIN_PLAYERS && !gameState()">WAITING FOR OPPONENTS...</p>
            <button *ngIf="isHost() && (members().length >= GAME_CONSTANTS.MIN_PLAYERS || gameState())" (click)="startGame()" class="btn-primary">
              {{ gameState() ? 'RESTART' : 'START MATCH' }}
            </button>
            <p *ngIf="!isHost() && members().length >= GAME_CONSTANTS.MIN_PLAYERS && !gameState()">WAITING FOR HOST...</p>
          </div>

          <div *ngIf="gameState()?.status === gameStatus.PLAYING" class="interaction-zone">
            <p *ngIf="!isMyTurn()" class="turn-wait">OBSERVING TURN...</p>
            <div class="minimal-keyboard" [class.disabled]="!isMyTurn()">
              <button *ngFor="let char of alphabet" 
                      (click)="onGuess(char)"
                      [disabled]="!isMyTurn() || isGuessed(char)"
                      class="key">
                {{ char }}
              </button>
            </div>
          </div>

          <!-- Final Result Overlay -->
          <div *ngIf="gameState()?.status === gameStatus.WON || gameState()?.status === gameStatus.LOST" class="result-backdrop animate-fade-in">
             <div class="result-box">
                <h2 [style.color]="gameState()?.status === gameStatus.WON ? 'var(--success)' : 'var(--error)'">
                  {{ gameState()?.status === gameStatus.WON ? 'VICTORY' : 'DEFEAT' }}
                </h2>
                <div class="word-summary">
                  <span class="label">SECRET WORD</span>
                  <span class="value">{{ gameState()?.displayWord }}</span>
                </div>
                <div class="reward-info" *ngIf="gameState()?.status === gameStatus.WON">
                   +{{ (10) }} SCORE GAINED
                </div>
                <div class="result-actions">
                  <button *ngIf="isHost()" (click)="startGame()" class="btn-primary w-full">NEW GAME</button>
                  <button (click)="leaveRoom()" class="btn-outline w-full mt-1">LOBBY</button>
                </div>
             </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .room-page { display: flex; height: 100vh; background: var(--bg-main); }
    
    .side-panel { 
      width: 300px; border-right: 2px solid var(--primary); display: flex; flex-direction: column; padding: 2.5rem 1.5rem; background: var(--bg-surface);
      h3 { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.1rem; color: var(--text-muted); margin-bottom: 1.5rem; }
    }
    
    .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .count { font-size: 0.75rem; font-weight: 900; background: var(--primary); color: white; padding: 0.1rem 0.4rem; border-radius: 4px; }
    
    .player-list { list-style: none; flex: 1; overflow-y: auto; }
    .player-item {
      display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; margin-bottom: 0px; border: 1px solid transparent; border-bottom: 1px solid var(--border-main);
      &:last-child { border-bottom: none; }
    }
    .player-avatar { border-radius: 50%; width: 32px; height: 32px; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.875rem; }
    .player-info { flex: 1; .name { display: block; font-size: 0.875rem; font-weight: 700; text-transform: uppercase; } .score { font-size: 0.7rem; font-weight: 600; color: var(--text-muted); } }
    .badge-host { font-size: 0.5rem; font-weight: 900; border: 1px solid var(--primary); padding: 0.1rem 0.3rem; letter-spacing: 0.05rem; }
    .btn-kick { background: transparent; border: 1px solid var(--error); color: var(--error); width: 24px; height: 24px; cursor: pointer; font-weight: 900; &:hover { background: var(--error); color: white; } }
    
    .panel-footer { margin-top: 2rem; display: flex; flex-direction: column; gap: 0.75rem; }
    .btn-danger-outline { background: transparent; border: 1px solid var(--error); color: var(--error); padding: 0.75rem; font-weight: 800; font-size: 0.75rem; cursor: pointer; &:hover { background: var(--error); color: white; } }
    .btn-outline { background: transparent; border: 1px solid var(--border-bold); color: var(--primary); padding: 0.75rem; font-weight: 800; font-size: 0.75rem; cursor: pointer; &:hover { background: var(--primary); color: white; } }

    .game-area { flex: 1; display: flex; flex-direction: column; padding: 2.5rem 3rem; background: #ffffff; }
    .game-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3rem; border-bottom: 2px solid var(--primary); padding-bottom: 1.5rem; }
    .room-meta h2 { font-size: 2rem; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05rem; }
    .turn-indicator { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); margin-top: 0.5rem; span { color: var(--primary-accent); } }
    
    .game-stats { display: flex; gap: 3rem; .stat { text-align: right; span { display: block; font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; } strong { font-size: 1.125rem; font-weight: 800; &.critical { color: var(--error); } } } }
    
    .game-view { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
    .canvas-container { padding: 2rem; margin-bottom: 2.5rem; }
    
    .word-reveal { font-size: 3.5rem; font-weight: 800; letter-spacing: 1rem; margin-bottom: 3.5rem; font-family: 'Inter', monospace; &.won { color: var(--success); } &.lost { color: var(--error); } }
    
    .interaction-zone { width: 100%; max-width: 650px; text-align: center; }
    .turn-wait { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); letter-spacing: 0.1rem; margin-bottom: 1.5rem; }
    .minimal-keyboard { display: grid; grid-template-columns: repeat(13, 1fr); gap: 4px; &.disabled { opacity: 0.3; pointer-events: none; } }
    .key { background: #f8fafc; border: 1px solid var(--border-main); color: var(--text-main); height: 44px; font-weight: 700; cursor: pointer; text-transform: uppercase; &:hover:not(:disabled) { border-color: var(--primary); background: white; } &:disabled { opacity: 0.2; } }

    .result-backdrop { position: absolute; inset: 0; background: rgba(255,255,255,0.98); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .result-box { width: 400px; text-align: center; padding: 4rem; border: 2px solid var(--primary); h2 { font-size: 3rem; font-weight: 900; letter-spacing: 0.2rem; margin-bottom: 2rem; } }
    .word-summary { margin-bottom: 2rem; .label { display: block; font-size: 0.7rem; font-weight: 800; color: var(--text-muted); margin-bottom: 0.5rem; } .value { font-size: 1.5rem; font-weight: 900; letter-spacing: 0.1rem; } }
    .reward-info { background: #f0fdf4; color: var(--success); font-weight: 800; font-size: 0.75rem; padding: 0.75rem; border: 1px solid var(--success); margin-bottom: 2rem; }
    .w-full { width: 100%; } .mt-1 { margin-top: 0.5rem; }
    .waiting-zone { text-align: center; font-weight: 800; letter-spacing: 0.05rem; }
  `]
})
export class RoomComponent implements OnInit, OnDestroy {
  currentRoom = signal<Room | null>(null);
  members = signal<User[]>([]);
  gameState = signal<GameState | null>(null);
  readonly GAME_CONSTANTS = GAME_CONSTANTS;
  alphabet = GAME_CONSTANTS.ALPHABET;
  maxMistakes = GAME_CONSTANTS.MAX_MISTAKES;
  gameStatus = GameStatus;
  
  private subs: Subscription[] = [];
  private roomId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socket: SocketService,
    private roomService: RoomService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.roomId = this.route.snapshot.params['id'];
    this.loadRoomDetails();
    this.setupSocket();
  }

  setupSocket() {
    this.socket.connect();
    this.socket.joinRoom(this.roomId);

    this.subs.push(
      this.socket.memberListUpdate$.subscribe(data => {
        this.members.set(data.members || []);
      }),
      this.socket.gameStateUpdate$.subscribe(data => {
        this.gameState.set(data);
      }),
      this.socket.roomDeleted$.subscribe(() => {
        alert('Room has been deleted by host');
        this.router.navigate(['/lobby']);
      }),
      this.socket.userKicked$.subscribe(data => {
        if (data.userId === this.currentUserId()) {
           alert('You have been kicked from the room');
           this.router.navigate(['/lobby']);
        }
      })
    );
  }

  loadRoomDetails() {
    this.roomService.getRoom(this.roomId).subscribe({
      next: (room) => {
        this.currentRoom.set(room);
        this.members.set(room.members || []);
      },
      error: () => this.router.navigate(['/lobby'])
    });
  }

  startGame() {
    this.roomService.startGame(this.roomId).subscribe();
  }

  onGuess(letter: string) {
    this.roomService.makeGuess(this.roomId, letter.toLowerCase()).subscribe();
  }

  isGuessed(letter: string) {
    return this.gameState()?.guessedLetters.includes(letter.toLowerCase());
  }

  isMyTurn() {
    return this.gameState()?.turnUserId === this.currentUserId();
  }

  getCurrentTurnUsername() {
     const turnId = this.gameState()?.turnUserId;
     return this.members().find(m => m.id === turnId)?.username || 'Unknown';
  }

  isHost() {
    return this.currentRoom()?.creatorId === this.currentUserId();
  }

  currentUserId() {
    return (this.auth.currentUser() as any)?.id || ''; // In a real app, decode JWT for ID
  }

  kickUser(userId: string) {
    this.roomService.kickUser(this.roomId, userId).subscribe();
  }

  deleteRoom() {
    if (confirm('Are you sure you want to delete this room?')) {
      this.roomService.deleteRoom(this.roomId).subscribe();
    }
  }

  leaveRoom() {
    this.socket.leaveRoom(this.roomId);
    this.router.navigate(['/lobby']);
  }

  getPlayerColor(index: number) {
     const colors = ['#f8fafc', '#f1f5f9', '#eff6ff', '#f0f9ff'];
     return colors[index % colors.length];
  }

  ngOnDestroy() {
    this.socket.leaveRoom(this.roomId);
    this.socket.disconnect();
    this.subs.forEach(s => s.unsubscribe());
  }
}
