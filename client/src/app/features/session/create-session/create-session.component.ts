import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-create-session',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-session.component.html',
})
export class CreateSessionComponent {
  private fb = inject(FormBuilder);
  private sessionService = inject(SessionService);

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    rawDiff: ['', Validators.required],
  });

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  createdSession = signal<{ id: string; title: string } | null>(null);

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { title, rawDiff } = this.form.getRawValue();

    this.sessionService.createSession(title, rawDiff).subscribe({
      next: (session) => {
        this.isSubmitting.set(false);
        this.createdSession.set({ id: session._id, title: session.title });
        this.form.reset();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Something went wrong. Please try again.'
        );
      },
    });
  }

  startAnother(): void {
    this.createdSession.set(null);
  }
}