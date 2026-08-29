import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReviewSession {
  _id: string;
  title: string;
  rawDiff: string;
  parsedDiff: unknown;
  status: string;
  reviewers: string[];
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/sessions`;

  createSession(title: string, rawDiff: string): Observable<ReviewSession> {
    return this.http.post<ReviewSession>(this.baseUrl, { title, rawDiff });
  }

  getSession(id: string): Observable<ReviewSession> {
    return this.http.get<ReviewSession>(`${this.baseUrl}/${id}`);
  }
}