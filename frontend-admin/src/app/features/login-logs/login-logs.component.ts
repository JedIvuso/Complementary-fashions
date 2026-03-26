import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";

@Component({
  selector: "app-login-logs",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Login Activity</h1>
          <p class="page-sub">
            Track who logged in, when, and whether it succeeded
          </p>
        </div>
      </div>

      <!-- Stats -->
      @if (stats()) {
        <div class="stats-grid" style="margin-bottom:24px">
          <div class="stat-card">
            <div class="stat-icon">🔐</div>
            <div class="stat-value">{{ stats()!.totalLogins | number }}</div>
            <div class="stat-label">Total Logins</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-value">{{ stats()!.loginsToday | number }}</div>
            <div class="stat-label">Logins Today</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👤</div>
            <div class="stat-value">
              {{ stats()!.uniqueUsersToday | number }}
            </div>
            <div class="stat-label">Unique Users Today</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⚠️</div>
            <div class="stat-value">{{ stats()!.failedToday | number }}</div>
            <div class="stat-label">Failed Attempts Today</div>
          </div>
        </div>
      }

      <!-- Filters -->
      <div class="card" style="padding:20px;margin-bottom:20px">
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
          <input
            class="form-input"
            style="flex:1;min-width:200px"
            placeholder="Search by email or name..."
            [(ngModel)]="filters.search"
            (input)="onSearch()"
          />
          <select
            class="form-input"
            style="width:160px"
            [(ngModel)]="filters.userType"
            (change)="load()"
          >
            <option value="">All Users</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
          </select>
          <select
            class="form-input"
            style="width:160px"
            [(ngModel)]="filters.success"
            (change)="load()"
          >
            <option value="">All Attempts</option>
            <option value="true">Successful</option>
            <option value="false">Failed</option>
          </select>
          <button class="btn btn-ghost btn-sm" (click)="reset()">Reset</button>
        </div>
      </div>

      <!-- Table -->
      <div class="card">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Email</th>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Reason</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              @if (loading()) {
                @for (i of [1, 2, 3, 4, 5]; track i) {
                  <tr>
                    @for (j of [1, 2, 3, 4, 5, 6, 7]; track j) {
                      <td>
                        <div
                          class="skeleton"
                          style="height:16px;border-radius:4px"
                        ></div>
                      </td>
                    }
                  </tr>
                }
              } @else {
                @for (log of logs(); track log.id) {
                  <tr>
                    <td
                      style="white-space:nowrap;color:var(--color-text-muted);font-size:0.8rem"
                    >
                      {{ log.createdAt | date: "dd MMM yyyy" }}<br />
                      <span style="font-size:0.75rem">{{
                        log.createdAt | date: "HH:mm:ss"
                      }}</span>
                    </td>
                    <td style="font-size:0.875rem">{{ log.email }}</td>
                    <td style="font-size:0.875rem">
                      {{ log.fullName || "—" }}
                    </td>
                    <td>
                      <span
                        class="badge"
                        [ngClass]="
                          log.userType === 'admin'
                            ? 'badge-info'
                            : 'badge-muted'
                        "
                      >
                        {{ log.userType }}
                      </span>
                    </td>
                    <td>
                      <span
                        class="badge"
                        [ngClass]="
                          log.success ? 'badge-success' : 'badge-error'
                        "
                      >
                        {{ log.success ? "Success" : "Failed" }}
                      </span>
                    </td>
                    <td style="font-size:0.8rem;color:var(--color-text-muted)">
                      {{ log.failureReason || "—" }}
                    </td>
                    <td style="font-size:0.8rem;color:var(--color-text-muted)">
                      {{ log.ipAddress || "—" }}
                    </td>
                  </tr>
                }
                @if (!logs().length && !loading()) {
                  <tr>
                    <td
                      colspan="7"
                      style="text-align:center;padding:40px;color:var(--color-text-muted)"
                    >
                      No login activity found
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div
            style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-top:1px solid var(--color-border)"
          >
            <span style="font-size:0.875rem;color:var(--color-text-muted)">
              {{ total() }} total records
            </span>
            <div style="display:flex;gap:8px">
              <button
                class="btn btn-ghost btn-sm"
                [disabled]="filters.page === 1"
                (click)="changePage(filters.page - 1)"
              >
                ← Prev
              </button>
              <span style="padding:6px 12px;font-size:0.875rem"
                >{{ filters.page }} / {{ totalPages() }}</span
              >
              <button
                class="btn btn-ghost btn-sm"
                [disabled]="filters.page === totalPages()"
                (click)="changePage(filters.page + 1)"
              >
                Next →
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class LoginLogsComponent implements OnInit {
  loading = signal(true);
  logs = signal<any[]>([]);
  stats = signal<any>(null);
  total = signal(0);
  totalPages = signal(1);
  searchTimeout: any;

  filters = {
    search: "",
    userType: "",
    success: "",
    page: 1,
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadStats();
    this.load();
  }

  loadStats() {
    this.api.get<any>("/admin/login-logs/stats").subscribe({
      next: (data) => this.stats.set(data),
    });
  }

  load() {
    this.loading.set(true);
    const params: any = { page: this.filters.page, limit: 50 };
    if (this.filters.userType) params.userType = this.filters.userType;
    if (this.filters.success !== "") params.success = this.filters.success;
    if (this.filters.search) params.search = this.filters.search;

    this.api.get<any>("/admin/login-logs", params).subscribe({
      next: (data) => {
        this.logs.set(data.logs);
        this.total.set(data.total);
        this.totalPages.set(data.pages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.filters.page = 1;
      this.load();
    }, 400);
  }

  changePage(page: number) {
    this.filters.page = page;
    this.load();
  }

  reset() {
    this.filters = { search: "", userType: "", success: "", page: 1 };
    this.load();
  }
}
