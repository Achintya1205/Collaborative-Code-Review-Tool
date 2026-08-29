import { Routes } from '@angular/router';
import { CreateSessionComponent } from './features/session/create-session/create-session.component';
import { SessionViewComponent } from './features/session/session-view/session-view.component';

export const routes: Routes = [
  { path: '', component: CreateSessionComponent },
  { path: 'session/:id', component: SessionViewComponent },
];