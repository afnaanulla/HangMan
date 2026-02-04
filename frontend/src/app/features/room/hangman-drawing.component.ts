import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hangman-drawing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hangman-svg-container">
      <svg viewBox="0 0 200 250" class="hangman-svg">
        <!-- Gallows -->
        <line x1="20" y1="230" x2="180" y2="230" class="gallows" />
        <line x1="50" y1="230" x2="50" y2="20" class="gallows" />
        <line x1="50" y1="20" x2="130" y2="20" class="gallows" />
        <line x1="130" y1="20" x2="130" y2="50" class="gallows" />

        <!-- Head -->
        <circle cx="130" cy="70" r="20" class="body-part" [class.visible]="incorrectGuesses >= 1" />
        <!-- Body -->
        <line x1="130" y1="90" x2="130" y2="160" class="body-part" [class.visible]="incorrectGuesses >= 2" />
        <!-- Left Arm -->
        <line x1="130" y1="110" x2="100" y2="140" class="body-part" [class.visible]="incorrectGuesses >= 3" />
        <!-- Right Arm -->
        <line x1="130" y1="110" x2="160" y2="140" class="body-part" [class.visible]="incorrectGuesses >= 4" />
        <!-- Left Leg -->
        <line x1="130" y1="160" x2="100" y2="200" class="body-part" [class.visible]="incorrectGuesses >= 5" />
        <!-- Right Leg -->
        <line x1="130" y1="160" x2="160" y2="200" class="body-part" [class.visible]="incorrectGuesses >= 6" />
      </svg>
    </div>
  `,
  styles: [`
    .hangman-svg-container {
      width: 100%;
      max-width: 300px;
      margin: 0 auto;
    }
    .hangman-svg {
      width: 100%;
      height: auto;
    }
    .gallows {
      stroke: var(--primary);
      stroke-width: 4;
      stroke-linecap: round;
    }
    .body-part {
      stroke: var(--primary);
      stroke-width: 4;
      stroke-linecap: round;
      fill: none;
      opacity: 0;
      transition: opacity 0.3s ease-in-out, transform 0.3s ease-out;
      transform: scale(0.95);
      
      &.visible {
        opacity: 1;
        transform: scale(1);
      }
    }
  `]
})
export class HangmanDrawingComponent {
  @Input() incorrectGuesses: number = 0;
}
