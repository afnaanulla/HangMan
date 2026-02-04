import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoomService } from '../../core/services/room.service';
import { AuthService } from '../../core/services/auth.service';
import { SocketService } from '../../core/services/socket.service';
import { Room } from '../../core/models/game.models';
import { Subscription } from 'rxjs';
import { GAME_CONSTANTS } from '../../core/constants/game.constants';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="lobby-container animate-fade-in">
      <header class="lobby-header">
        <div class="brand">
          <h1>LOBBY</h1>
          <p>Find or Create a Match</p>
        </div>
        <div class="user-info">
          <div class="user-meta">
            <span class="username">{{ auth.currentUser()?.username }}</span>
            <div class="user-avatar">{{ auth.currentUser()?.username?.[0] | uppercase }}</div>
          </div>
          <div class="actions">
            <button (click)="showCreateModal = true" class="btn-primary">New Room</button>
            <button (click)="auth.logout()" class="btn-text">Logout</button>
          </div>
        </div>
      </header>

      <main class="rooms-container">
        <div *ngIf="loading" class="loading-state">
          <div class="line-spinner"></div>
          <p>SCANNING FOR ROOMS...</p>
        </div>

        <div *ngIf="!loading && rooms.length === 0" class="empty-state">
          <p>NO ACTIVE ROOMS FOUND. INITIALIZE ONE?</p>
        </div>

        <div class="rooms-grid">
          <div *ngFor="let room of rooms; let i = index" 
               class="room-card animate-fade-in" 
               [class.expanded]="activePasswordRoomId === room.id"
               [style.background-color]="getRoomColor(i)">
            
            <div class="room-content">
              <div class="room-main">
                <div class="title-row">
                  <span class="room-name">{{ room.name }}</span>
                  <span *ngIf="room.hasPassword" class="lock-tag">LOCKED</span>
                </div>
                <div class="meta-row">
                  <span class="player-count">{{ room._count?.members || 0 }} / {{ room.playerLimit }} PLAYERS</span>
                  <span class="host-name">BY MEMBER #{{ room.creatorId.slice(0,4) }}</span>
                </div>
              </div>

              <!-- Inline Password Entry -->
              <div *ngIf="activePasswordRoomId === room.id" class="inline-password">
                <input type="password" [(ngModel)]="joinPassword" placeholder="PASSWORD" class="input-flat" (keyup.enter)="submitJoinPassword(room.id)" autofocus>
                <div class="inline-actions">
                  <button (click)="activePasswordRoomId = null" class="btn-outline">CLOSE</button>
                  <button (click)="submitJoinPassword(room.id)" class="btn-primary btn-sm">JOIN</button>
                </div>
              </div>

              <button *ngIf="activePasswordRoomId !== room.id"
                (click)="onJoinRoom(room)" 
                [disabled]="(room._count?.members || 0) >= room.playerLimit" 
                class="btn-action">
                {{ room.hasPassword ? 'ACCESS' : 'ENTER' }}
              </button>
            </div>
          </div>
        </div>
      </main>

      <!-- Create Room Modal -->
      <div *ngIf="showCreateModal" class="modal-backdrop animate-fade-in">
        <div class="modal-content">
          <h2>NEW ROOM</h2>
          <form (ngSubmit)="onCreateRoom()">
            <div class="form-group">
              <label>ROOM NAME</label>
              <input type="text" name="name" [(ngModel)]="newRoom.name" required class="input-flat">
            </div>
            
            <div class="form-group">
              <label>MAX PLAYERS ({{ GAME_CONSTANTS.MIN_PLAYERS }}-{{ GAME_CONSTANTS.MAX_PLAYERS }})</label>
              <input type="number" name="limit" [(ngModel)]="newRoom.playerLimit" [min]="GAME_CONSTANTS.MIN_PLAYERS" [max]="GAME_CONSTANTS.MAX_PLAYERS" class="input-flat">
            </div>

            <div class="form-group">
              <label>SECRET PASSWORD (OPTIONAL)</label>
              <input type="password" name="pwd" [(ngModel)]="newRoom.password" class="input-flat">
            </div>

            <div class="modal-actions">
              <button type="button" (click)="showCreateModal = false" class="btn-text">CANCEL</button>
              <button type="submit" class="btn-primary">CREATE</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .lobby-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 2rem;
    }
    .lobby-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 4rem;
      border-bottom: 2px solid var(--primary);
      padding-bottom: 1.5rem;
      
      .brand {
        h1 { font-size: 2.5rem; font-weight: 900; letter-spacing: -0.05rem; line-height: 1; }
        p { color: var(--text-muted); text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1rem; margin-top: 0.5rem; }
      }
      
      .user-info {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.75rem;
        
        .user-meta { display: flex; align-items: center; gap: 0.75rem; }
        .user-avatar { width: 32px; height: 32px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.875rem; }
        .username { font-weight: 700; text-transform: uppercase; font-size: 0.875rem; }
        .actions { display: flex; gap: 1.5rem; align-items: center; }
      }
    }
    
    .rooms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1rem;
    }
    
    .room-card {
      border: 1px solid var(--border-main);
      padding: 1.5rem;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      
      &:hover { border-color: var(--primary); transform: translateY(-2px); }
      &.expanded { border-color: var(--primary); background: white !important; }

      .title-row { display: flex; justify-content: space-between; align-items: center; }
      .room-name { font-size: 1.125rem; font-weight: 800; text-transform: uppercase; }
      .lock-tag { font-size: 0.625rem; font-weight: 900; background: var(--primary); color: white; padding: 0.125rem 0.375rem; border-radius: 2px; }
      
      .meta-row {
        margin-top: 0.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        .player-count { background: #f1f5f9; padding: 0.125rem 0.5rem; border-radius: 4px; color: var(--primary); }
      }
    }
    
    .btn-action {
      margin-top: 1.5rem;
      margin-left: auto;
      background: transparent;
      border: 1px solid var(--border-bold);
      color: var(--primary);
      padding: 0.625rem 1.5rem;
      font-weight: 700;
      cursor: pointer;
      font-size: 0.75rem;
      text-transform: uppercase;
      align-self: flex-end;
      
      &:hover:not(:disabled) { background: var(--primary); color: white; }
      &:disabled { opacity: 0.3; }
    }

    .inline-password {
      margin-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      
      .input-flat { padding: 0.5rem; font-size: 0.75rem; font-weight: 700; border-radius: 4px; }
      .inline-actions { display: flex; gap: 0.5rem; }
      .btn-outline { background: transparent; border: 1px solid var(--border-main); padding: 0.5rem; font-size: 0.7rem; font-weight: 700; cursor: pointer; }
      .btn-sm { padding: 0.5rem; font-size: 0.7rem; flex: 1; }
    }
    
    .modal-backdrop {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(255,255,255,0.95);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000;
    }
    
    .modal-content {
      width: 100%; max-width: 440px;
      padding: 3rem;
      border: 1px solid var(--border-bold);
      background: white;
      
      h2 { font-size: 1.5rem; font-weight: 900; margin-bottom: 2rem; }
      .form-group { margin-bottom: 1.5rem; label { display: block; font-size: 0.75rem; font-weight: 800; margin-bottom: 0.5rem; } }
      .modal-actions { display: flex; justify-content: flex-end; gap: 1.5rem; margin-top: 2.5rem; }
    }
    
    .btn-text { background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
    .btn-outline-main { background: transparent; border: 1px solid var(--border-main); padding: 0.5rem 1rem; font-weight: 700; }
    .line-spinner { width: 40px; height: 2px; background: var(--primary); animation: slide 1s infinite alternate; margin: 0 auto 1.5rem; }
    @keyframes slide { from { transform: scaleX(0.2); } to { transform: scaleX(1); } }
    .loading-state, .empty-state { text-align: center; padding: 5rem; font-weight: 800; font-size: 0.875rem; color: var(--text-muted); letter-spacing: 0.1rem; }
  `]
})
export class LobbyComponent implements OnInit, OnDestroy {
  rooms: Room[] = [];
  loading = true;
  showCreateModal = false;
  readonly GAME_CONSTANTS = GAME_CONSTANTS;
  activePasswordRoomId: string | null = null;
  joinPassword = '';
  newRoom = { name: '', playerLimit: 4, password: '' };
  private subs: Subscription[] = [];

  constructor(
    private roomService: RoomService,
    private socket: SocketService,
    private router: Router,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.loadRooms();
    this.socket.connect();
    this.subs.push(
      this.socket.roomListUpdate$.subscribe(rooms => {
        this.rooms = rooms;
      })
    );
  }

  loadRooms() {
    this.loading = true;
    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onJoinRoom(room: Room) {
    if (room._count?.members! >= room.playerLimit) return;
    
    if (room.hasPassword) {
      this.activePasswordRoomId = room.id;
      this.joinPassword = '';
    } else {
      this.join(room.id);
    }
  }

  submitJoinPassword(roomId: string) {
    if (this.joinPassword) {
      this.join(roomId, this.joinPassword);
    }
  }

  private join(roomId: string, password?: string) {
    this.roomService.joinRoom(roomId, { password }).subscribe({
      next: () => {
        this.activePasswordRoomId = null;
        this.router.navigate(['/room', roomId]);
      },
      error: (err) => alert(err.error?.message || 'Failed to join')
    });
  }

  onCreateRoom() {
    this.roomService.createRoom(this.newRoom).subscribe({
      next: (room) => {
        this.showCreateModal = false;
        this.router.navigate(['/room', room.id]);
      },
      error: (err) => alert(err.error?.message || 'Failed to create room')
    });
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  // Minimalist currated colors
  getRoomColor(index: number): string {
    const colors = GAME_CONSTANTS.CURATED_COLORS;
    return colors[index % colors.length];
  }
}
