import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container animate-fade-in">
      <div class="minimal-card auth-card">
        <h1>SIGN UP</h1>
        <p class="subtitle">Create an account to start playing</p>
        
        <form (ngSubmit)="onSignup()" #signupForm="ngForm">
          <div class="form-group">
            <label>Username</label>
            <input type="text" name="username" [(ngModel)]="dto.username" required class="input-flat" placeholder="e.g. wordmaster">
          </div>
          
          <div class="form-group">
            <label>Password</label>
            <input type="password" name="password" [(ngModel)]="dto.password" required minlength="6" class="input-flat" placeholder="••••••••">
            <small *ngIf="signupForm.controls['password']?.touched && signupForm.controls['password']?.errors?.['minlength']" class="help-text">
              Password must be at least 6 characters
            </small>
          </div>
          
          <button type="submit" [disabled]="!signupForm.valid || loading" class="btn-primary w-full">
            {{ loading ? 'Creating Account...' : 'Sign Up' }}
          </button>
        </form>
        
        <p class="footer-text">
          Already have an account? <a [routerLink]="['/login']">Login</a>
        </p>
        
        <div *ngIf="error" class="error-box animate-fade-in">
          {{ error }}
        </div>
        
        <div *ngIf="success" class="success-box animate-fade-in">
          Account created! Taking you to login...
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
      
      .help-text {
        font-size: 0.70rem;
        color: var(--error);
        margin-top: 0.5rem;
        display: block;
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
    .success-box {
      margin-top: 1.5rem;
      padding: 1rem;
      background: #f0fff4;
      border: 1px solid var(--success);
      color: var(--success);
      font-size: 0.875rem;
    }
  `]
})
export class SignupComponent {
  dto = { username: '', password: '' };
  loading = false;
  error = '';
  success = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSignup() {
    this.loading = true;
    this.error = '';
    this.auth.signup(this.dto).subscribe({
      next: () => {
        this.success = true;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Signup failed';
        this.loading = false;
      }
    });
  }
}
