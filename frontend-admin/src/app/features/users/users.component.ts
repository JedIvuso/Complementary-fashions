import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="users-admin">
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Customers</h1>
          <p class="page-sub">{{ total() }} registered customers</p>
        </div>
      </div>

      <div class="card">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Status</th>
                <th style="text-align:right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (loading()) {
                @for (i of [1,2,3,4,5]; track i) {
                  <tr><td colspan="6"><div class="skeleton" style="height:18px;margin:6px 0"></div></td></tr>
                }
              }
              @for (user of users(); track user.id) {
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px">
                      <div class="user-avatar">{{ getInitials(user) }}</div>
                      <div>
                        <div style="font-weight:500">{{ user.firstName }} {{ user.lastName }}</div>
                        <div style="font-size:0.75rem;color:var(--color-text-muted)">ID: {{ user.id.slice(0,8) }}…</div>
                      </div>
                    </div>
                  </td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.phoneNumber || '—' }}</td>
                  <td style="color:var(--color-text-muted);font-size:0.8125rem">{{ user.createdAt | date:'dd MMM yyyy' }}</td>
                  <td>
                    <span class="badge" [class]="user.isActive ? 'badge-success' : 'badge-error'">
                      {{ user.isActive ? 'Active' : 'Blocked' }}
                    </span>
                  </td>
                  <td>
                    <div style="display:flex;justify-content:flex-end;gap:6px">
                      <button class="btn btn-sm" [class]="user.isActive ? 'btn-danger' : 'btn-primary'" (click)="toggleBlock(user)">
                        {{ user.isActive ? 'Block' : 'Unblock' }}
                      </button>
                    </div>
                  </td>
                </tr>
              }
              @if (!loading() && !users().length) {
                <tr><td colspan="6" style="text-align:center;padding:48px;color:var(--color-text-muted)">No customers yet</td></tr>
              }
            </tbody>
          </table>
        </div>

        @if (totalPages() > 1) {
          <div style="padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--color-border)">
            <span style="font-size:0.875rem;color:var(--color-text-muted)">Page {{ page() }} of {{ totalPages() }}</span>
            <div class="pagination">
              <button class="page-btn" [disabled]="page()===1" (click)="goPage(page()-1)">‹</button>
              @for (p of getPages(); track p) {
                <button class="page-btn" [class.active]="p===page()" (click)="goPage(p)">{{ p }}</button>
              }
              <button class="page-btn" [disabled]="page()===totalPages()" (click)="goPage(page()+1)">›</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .user-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--color-accent-light); color: var(--color-accent); display: flex; align-items: center; justify-content: center; font-size: 0.8125rem; font-weight: 600; flex-shrink: 0; }
  `]
})
export class AdminUsersComponent implements OnInit {
  users = signal<any[]>([]);
  loading = signal(true);
  page = signal(1);
  total = signal(0);
  totalPages = signal(1);
  limit = 20;

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.get<any>('/users', { page: this.page(), limit: this.limit }).subscribe({
      next: (res) => {
        this.users.set(res.data);
        this.total.set(res.meta.total);
        this.totalPages.set(res.meta.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleBlock(user: any) {
    const action = user.isActive ? 'Block' : 'Unblock';
    if (!confirm(`${action} ${user.firstName} ${user.lastName}?`)) return;
    this.api.put(`/users/${user.id}/toggle-block`, {}).subscribe({
      next: () => this.load(),
      error: () => alert('Failed to update user'),
    });
  }

  getInitials(user: any) {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  }

  goPage(p: number) { this.page.set(p); this.load(); }
  getPages() {
    const pages = [];
    for (let i = 1; i <= this.totalPages(); i++) pages.push(i);
    return pages.slice(Math.max(0, this.page() - 3), this.page() + 2);
  }
}
