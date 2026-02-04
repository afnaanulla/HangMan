import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private url = 'http://localhost:3000';

  // Events
  memberListUpdate$ = new Subject<any>();
  gameStateUpdate$ = new Subject<any>();
  roomDeleted$ = new Subject<void>();
  userKicked$ = new Subject<any>();
  roomListUpdate$ = new Subject<any[]>();

  constructor(private auth: AuthService) {}

  connect() {
    const token = this.auth.getToken();
    if (!token) return;

    this.socket = io(this.url, {
      auth: { token: `Bearer ${token}` }
    });

    this.socket.on('memberListUpdate', (data: any) => this.memberListUpdate$.next(data));
    this.socket.on('gameStateUpdate', (data: any) => this.gameStateUpdate$.next(data));
    this.socket.on('roomDeleted', () => this.roomDeleted$.next());
    this.socket.on('userKicked', (data: any) => this.userKicked$.next(data));
    this.socket.on('roomListUpdate', (data: any[]) => this.roomListUpdate$.next(data));
  }

  joinRoom(roomId: string) {
    this.socket?.emit('joinRoom', roomId);
  }

  leaveRoom(roomId: string) {
    this.socket?.emit('leaveRoom', roomId);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}
