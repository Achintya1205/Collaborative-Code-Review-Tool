import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SessionService, ReviewSession } from '../../../core/services/session.service';
import { SocketService } from '../../../core/services/socket.service';

@Component({
  selector: 'app-session-view',
  standalone: true,
  templateUrl: './session-view.component.html',
})
export class SessionViewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private sessionService = inject(SessionService);
  private socketService = inject(SocketService);

  session = signal<ReviewSession | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  private sessionId: string | null = null;

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.paramMap.get('id');

    if (!this.sessionId) {
      this.errorMessage.set('No session ID provided.');
      this.isLoading.set(false);
      return;
    }

    this.socketService.joinSession(this.sessionId);

    this.sessionService.getSession(this.sessionId).subscribe({
      next: (session) => {
        this.session.set(session);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.status === 404
            ? 'Review session not found.'
            : 'Failed to load review session.'
        );
        this.isLoading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.sessionId) {
      this.socketService.leaveSession(this.sessionId);
    }
  }
}