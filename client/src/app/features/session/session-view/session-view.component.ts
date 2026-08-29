import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SessionService, ReviewSession } from '../../../core/services/session.service';

@Component({
  selector: 'app-session-view',
  standalone: true,
  templateUrl: './session-view.component.html',
})
export class SessionViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private sessionService = inject(SessionService);

  session = signal<ReviewSession | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage.set('No session ID provided.');
      this.isLoading.set(false);
      return;
    }

    this.sessionService.getSession(id).subscribe({
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
}