import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container animate-fade-in">
      <div class="minimal-card auth-card">
        <h1>LOGIN</h1>
        <p class="subtitle">Enter your credentials to continue</p>
        
        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
          <div class="form-group">
            <label>Username</label>
            <input type="text" name="username" [(ngModel)]="dto.username" required class="input-flat" placeholder="e.g. wordmaster">
          </div>
          
          <div class="form-group">
            <label>Password</label>
            <input type="password" name="password" [(ngModel)]="dto.password" required class="input-flat" placeholder="••••••••">
          </div>
          
          <button type="submit" [disabled]="!loginForm.valid || loading" class="btn-primary w-full">
            {{ loading ? 'Authenticating...' : 'Login' }}
          </button>
        </form>
        
        <p class="footer-text">
          Don't have an account? <a [routerLink]="['/signup']">Sign up</a>
        </p>
        
        <div *ngIf="error" class="error-box animate-fade-in">
          {{ error }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: var(--bg-surface);
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 3.5rem;
      border: 1px solid var(--border-bold);
      
      h1 {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
        letter-spacing: 0.2rem;
        font-weight: 800;
        color: var(--primary);
      }
      
      .subtitle {
        color: var(--text-muted);
        margin-bottom: 2.5rem;
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.05rem;
      }
    }
    .form-group {
      text-align: left;
      margin-bottom: 1.5rem;
      
      label {
        display: block;
        font-size: 0.75rem;
        margin-bottom: 0.5rem;
        color: var(--text-main);
        font-weight: 600;
        text-transform: uppercase;
      }
    }
    .w-full { width: 100%; }
    .footer-text {
      margin-top: 2rem;
      font-size: 0.875rem;
      color: var(--text-muted);
      
      a {
        color: var(--primary-accent);
        text-decoration: none;
        font-weight: 600;
        &:hover { text-decoration: underline; }
      }
    }
    .error-box {
      margin-top: 1.5rem;
      padding: 1rem;
      background: #fff5f5;
      border: 1px solid var(--error);
      color: var(--error);
      font-size: 0.875rem;
    }
  `]
})
export class LoginComponent {
  dto = { username: '', password: '' };
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    this.loading = true;
    this.error = '';
    this.auth.login(this.dto).subscribe({
      next: () => this.router.navigate(['/lobby']),
      error: (err) => {
        this.error = err.error?.message || 'Login failed';
        this.loading = false;
      }
    });
  }
}
