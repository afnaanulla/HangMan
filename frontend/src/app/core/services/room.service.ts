import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Room } from '../models/game.models';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = 'http://localhost:3000/rooms';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders() {
    return new HttpHeaders().set('Authorization', `Bearer ${this.auth.getToken()}`);
  }

  getRooms() {
    return this.http.get<Room[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  createRoom(dto: any) {
    return this.http.post<Room>(this.apiUrl, dto, { headers: this.getHeaders() });
  }

  getRoom(roomId: string) {
    return this.http.get<Room>(`${this.apiUrl}/${roomId}`, { headers: this.getHeaders() });
  }

  joinRoom(roomId: string, dto: any = {}) {
    return this.http.post<Room>(`${this.apiUrl}/${roomId}/join`, dto, { headers: this.getHeaders() });
  }

  deleteRoom(roomId: string) {
    return this.http.delete(`${this.apiUrl}/${roomId}`, { headers: this.getHeaders() });
  }

  kickUser(roomId: string, userId: string) {
    return this.http.patch(`${this.apiUrl}/${roomId}/kick/${userId}`, {}, { headers: this.getHeaders() });
  }

  startGame(roomId: string) {
    return this.http.post(`${this.apiUrl}/${roomId}/game/start`, {}, { headers: this.getHeaders() });
  }

  makeGuess(roomId: string, letter: string) {
    return this.http.post(`${this.apiUrl}/${roomId}/game/guess`, { letter }, { headers: this.getHeaders() });
  }
}
