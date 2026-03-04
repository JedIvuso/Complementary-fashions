import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast-{{ toast.type }}" (click)="toastService.remove(toast.id)">
          <span class="toast-icon">{{ icons[toast.type] }}</span>
          <span>{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; }
    .toast {
      min-width: 280px; max-width: 380px; padding: 14px 16px;
      border-radius: var(--radius-sm); background: var(--color-surface);
      border: 1px solid var(--color-border); box-shadow: var(--shadow-lg);
      display: flex; align-items: center; gap: 10px;
      font-size: 0.875rem; cursor: pointer;
      animation: toast-in 0.3s ease; color: var(--color-text);
    }
    .toast-success { border-left: 3px solid var(--color-success); }
    .toast-error { border-left: 3px solid var(--color-error); }
    .toast-info { border-left: 3px solid var(--color-accent); }
    .toast-icon { font-size: 1.1rem; flex-shrink: 0; }
    @keyframes toast-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  `]
})
export class ToastContainerComponent {
  icons = { success: '✅', error: '❌', info: 'ℹ️' };
  constructor(public toastService: ToastService) {}
}
