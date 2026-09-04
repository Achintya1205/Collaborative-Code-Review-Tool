import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Comment {
  _id: string;
  session: string;
  filePath: string;
  lineNumber: number;
  authorName: string;
  content: string;
  parentComment: string | null;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentPayload {
  filePath: string;
  lineNumber: number;
  authorName: string;
  content: string;
  parentComment?: string | null;
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  private http = inject(HttpClient);

  private baseUrl(sessionId: string): string {
    return `${environment.apiUrl}/sessions/${sessionId}/comments`;
  }

  getComments(sessionId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(this.baseUrl(sessionId));
  }

  createComment(sessionId: string, payload: CreateCommentPayload): Observable<Comment> {
    return this.http.post<Comment>(this.baseUrl(sessionId), payload);
  }

  resolveComment(sessionId: string, commentId: string, resolved: boolean): Observable<Comment> {
    return this.http.patch<Comment>(`${this.baseUrl(sessionId)}/${commentId}/resolve`, {
      resolved,
    });
  }
}