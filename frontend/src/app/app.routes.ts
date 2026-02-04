import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { 
    path: 'lobby', 
    loadComponent: () => import('./features/lobby/lobby.component').then(m => m.LobbyComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'room/:id', 
    loadComponent: () => import('./features/room/room.component').then(m => m.RoomComponent),
    canActivate: [authGuard]
  },
  { path: '', redirectTo: 'lobby', pathMatch: 'full' },
  { path: '**', redirectTo: 'lobby' }
];
