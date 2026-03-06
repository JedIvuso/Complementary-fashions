import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";

@Component({
  selector: "app-admin-users",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="users-admin">
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Customers</h1>
          <p class="page-sub">{{ total() }} registered customers</p>
        </div>
        <button class="btn btn-ghost btn-sm" (click)="exportCsv()">
          ⬇️ Export CSV
        </button>
      </div>

      <!-- Search & Filter -->
      <div class="filters-row">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            class="search-input"
            [(ngModel)]="search"
            (input)="onSearch()"
            placeholder="Search name or email…"
          />
          @if (search) {
            <button class="clear-btn" (click)="clearSearch()">✕</button>
          }
        </div>
        <div class="filter-tabs">
          <button
            class="filter-tab"
            [class.active]="statusFilter === ''"
            (click)="setFilter('')"
          >
            All
          </button>
          <button
            class="filter-tab"
            [class.active]="statusFilter === 'active'"
            (click)="setFilter('active')"
          >
            Active
          </button>
          <button
            class="filter-tab"
            [class.active]="statusFilter === 'blocked'"
            (click)="setFilter('blocked')"
          >
            Blocked
          </button>
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
                @for (i of [1, 2, 3, 4, 5]; track i) {
                  <tr>
                    <td colspan="6">
                      <div
                        class="skeleton"
                        style="height:18px;margin:6px 0"
                      ></div>
                    </td>
                  </tr>
                }
              }
              @for (user of filteredUsers(); track user.id) {
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px">
                      <div class="user-avatar">{{ getInitials(user) }}</div>
                      <div>
                        <div style="font-weight:500">
                          {{ user.firstName }} {{ user.lastName }}
                        </div>
                        <div
                          style="font-size:0.75rem;color:var(--color-text-muted)"
                        >
                          ID: {{ user.id.slice(0, 8) }}…
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.phoneNumber || "—" }}</td>
                  <td style="color:var(--color-text-muted);font-size:0.8125rem">
                    {{ user.createdAt | date: "dd MMM yyyy" }}
                  </td>
                  <td>
                    <span
                      class="badge"
                      [class]="user.isActive ? 'badge-success' : 'badge-error'"
                    >
                      {{ user.isActive ? "Active" : "Blocked" }}
                    </span>
                  </td>
                  <td>
                    <div style="display:flex;justify-content:flex-end;gap:6px">
                      <button
                        class="btn btn-sm"
                        [class]="user.isActive ? 'btn-danger' : 'btn-primary'"
                        (click)="toggleBlock(user)"
                      >
                        {{ user.isActive ? "Block" : "Unblock" }}
                      </button>
                    </div>
                  </td>
                </tr>
              }
              @if (!loading() && !filteredUsers().length) {
                <tr>
                  <td
                    colspan="6"
                    style="text-align:center;padding:48px;color:var(--color-text-muted)"
                  >
                    No customers found
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (totalPages() > 1) {
          <div
            style="padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--color-border)"
          >
            <span style="font-size:0.875rem;color:var(--color-text-muted)"
              >Page {{ page() }} of {{ totalPages() }}</span
            >
            <div class="pagination">
              <button
                class="page-btn"
                [disabled]="page() === 1"
                (click)="goPage(page() - 1)"
              >
                ‹
              </button>
              @for (p of getPages(); track p) {
                <button
                  class="page-btn"
                  [class.active]="p === page()"
                  (click)="goPage(p)"
                >
                  {{ p }}
                </button>
              }
              <button
                class="page-btn"
                [disabled]="page() === totalPages()"
                (click)="goPage(page() + 1)"
              >
                ›
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .filters-row {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }
      .search-box {
        position: relative;
        display: flex;
        align-items: center;
        min-width: 280px;
      }
      .search-icon {
        position: absolute;
        left: 12px;
        font-size: 0.9rem;
        pointer-events: none;
      }
      .search-input {
        width: 100%;
        padding: 8px 36px;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        background: var(--color-surface);
        color: var(--color-text);
        font-size: 0.875rem;
        font-family: var(--font-body);
      }
      .clear-btn {
        position: absolute;
        right: 10px;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-text-muted);
        font-size: 0.875rem;
      }
      .filter-tabs {
        display: flex;
        gap: 4px;
        background: var(--color-surface);
        padding: 6px;
        border-radius: 10px;
        border: 1px solid var(--color-border);
      }
      .filter-tab {
        padding: 6px 14px;
        border-radius: 7px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 0.8125rem;
        font-family: var(--font-body);
        color: var(--color-text-secondary);
        transition: all 0.2s;
      }
      .filter-tab.active {
        background: var(--color-accent);
        color: white;
        font-weight: 500;
      }
      .filter-tab:hover:not(.active) {
        background: var(--color-surface-2);
      }
      .user-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--color-accent-light);
        color: var(--color-accent);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8125rem;
        font-weight: 600;
        flex-shrink: 0;
      }
    `,
  ],
})
export class AdminUsersComponent implements OnInit {
  users = signal<any[]>([]);
  loading = signal(true);
  page = signal(1);
  total = signal(0);
  totalPages = signal(1);
  limit = 20;
  search = "";
  statusFilter = "";

  constructor(private api: ApiService) {}
  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api
      .get<any>("/users", { page: this.page(), limit: this.limit })
      .subscribe({
        next: (res) => {
          this.users.set(res.data);
          this.total.set(res.meta.total);
          this.totalPages.set(res.meta.totalPages);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  filteredUsers() {
    let list = this.users();
    if (this.statusFilter === "active") list = list.filter((u) => u.isActive);
    if (this.statusFilter === "blocked") list = list.filter((u) => !u.isActive);
    if (this.search.trim()) {
      const q = this.search.toLowerCase();
      list = list.filter(
        (u) =>
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q),
      );
    }
    return list;
  }

  onSearch() {}
  clearSearch() {
    this.search = "";
  }
  setFilter(f: string) {
    this.statusFilter = f;
  }

  toggleBlock(user: any) {
    if (
      !confirm(
        `${user.isActive ? "Block" : "Unblock"} ${user.firstName} ${user.lastName}?`,
      )
    )
      return;
    this.api
      .put(`/users/${user.id}/toggle-block`, {})
      .subscribe({ next: () => this.load() });
  }

  exportCsv() {
    const headers = "Name,Email,Phone,Status,Joined\n";
    const rows = this.users()
      .map(
        (u) =>
          `${u.firstName} ${u.lastName},${u.email},${u.phoneNumber || ""},${u.isActive ? "Active" : "Blocked"},${new Date(u.createdAt).toLocaleDateString()}`,
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  getInitials(user: any) {
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  }
  goPage(p: number) {
    this.page.set(p);
    this.load();
  }
  getPages() {
    const pages = [];
    for (let i = 1; i <= this.totalPages(); i++) pages.push(i);
    return pages.slice(Math.max(0, this.page() - 3), this.page() + 2);
  }
}
