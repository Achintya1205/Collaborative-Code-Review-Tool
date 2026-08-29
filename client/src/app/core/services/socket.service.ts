import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket = io(environment.socketUrl);

  joinSession(sessionId: string): void {
    this.socket.emit('join-session', sessionId);
  }

  leaveSession(sessionId: string): void {
    this.socket.emit('leave-session', sessionId);
  }

  getSocket(): Socket {
    return this.socket;
  }
}