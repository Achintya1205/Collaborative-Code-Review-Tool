import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SessionService, ReviewSession } from '../../../core/services/session.service';
import { SocketService } from '../../../core/services/socket.service';
import { CommentService, Comment } from '../../../core/services/comment.service';

@Component({
  selector: 'app-session-view',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './session-view.component.html',
})
export class SessionViewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private sessionService = inject(SessionService);
  private socketService = inject(SocketService);
  private commentService = inject(CommentService);

  session = signal<ReviewSession | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  viewers = signal<string[]>([]);
  comments = signal<Comment[]>([]);

  activeLineKey = signal<string | null>(null);
  replyingToId = signal<string | null>(null);

  // Plain (non-signal) fields for form inputs — bound via ngModel
  authorNameValue = '';
  newCommentTextValue = '';
  replyTextValue = '';

  private sessionId: string | null = null;
  private onPresenceUpdate = (viewers: string[]) => this.viewers.set(viewers);

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.paramMap.get('id');

    if (!this.sessionId) {
      this.errorMessage.set('No session ID provided.');
      this.isLoading.set(false);
      return;
    }

    this.socketService.getSocket().on('presence-update', this.onPresenceUpdate);
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

    this.commentService.getComments(this.sessionId).subscribe({
      next: (comments) => this.comments.set(comments),
    });
  }

  ngOnDestroy(): void {
    if (this.sessionId) {
      this.socketService.leaveSession(this.sessionId);
    }
    this.socketService.getSocket().off('presence-update', this.onPresenceUpdate);
  }

  lineKey(filePath: string, lineNumber: number | null): string {
    return `${filePath}:${lineNumber}`;
  }

  toggleLine(filePath: string, lineNumber: number | null): void {
    const key = this.lineKey(filePath, lineNumber);
    this.activeLineKey.set(this.activeLineKey() === key ? null : key);
    this.newCommentTextValue = '';
    this.replyingToId.set(null);
  }

  topLevelCommentsFor(filePath: string, lineNumber: number | null): Comment[] {
    const key = this.lineKey(filePath, lineNumber);
    return this.comments()
      .filter((c) => this.lineKey(c.filePath, c.lineNumber) === key && !c.parentComment)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  repliesFor(commentId: string): Comment[] {
    return this.comments()
      .filter((c) => c.parentComment === commentId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  commentCountFor(filePath: string, lineNumber: number | null): number {
    const key = this.lineKey(filePath, lineNumber);
    return this.comments().filter((c) => this.lineKey(c.filePath, c.lineNumber) === key).length;
  }

  submitNewComment(filePath: string, lineNumber: number | null): void {
    if (!this.sessionId || lineNumber === null) return;
    if (!this.authorNameValue.trim() || !this.newCommentTextValue.trim()) return;

    this.commentService
      .createComment(this.sessionId, {
        filePath,
        lineNumber,
        authorName: this.authorNameValue.trim(),
        content: this.newCommentTextValue.trim(),
      })
      .subscribe({
        next: (comment) => {
          this.comments.set([...this.comments(), comment]);
          this.newCommentTextValue = '';
        },
      });
  }

  startReply(commentId: string): void {
    this.replyingToId.set(this.replyingToId() === commentId ? null : commentId);
    this.replyTextValue = '';
  }

  submitReply(filePath: string, lineNumber: number | null, parentId: string): void {
    if (!this.sessionId || lineNumber === null) return;
    if (!this.authorNameValue.trim() || !this.replyTextValue.trim()) return;

    this.commentService
      .createComment(this.sessionId, {
        filePath,
        lineNumber,
        authorName: this.authorNameValue.trim(),
        content: this.replyTextValue.trim(),
        parentComment: parentId,
      })
      .subscribe({
        next: (comment) => {
          this.comments.set([...this.comments(), comment]);
          this.replyTextValue = '';
          this.replyingToId.set(null);
        },
      });
  }
}