import { Component, OnInit, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";

@Component({
  selector: "app-analytics",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="analytics-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">📊 Sales Analytics</h1>
          <p class="page-sub">
            Track performance across online and in-store sales
          </p>
        </div>
        <div class="header-actions">
          <select
            class="form-select"
            [(ngModel)]="period"
            (change)="loadAnalytics()"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-grid">
          @for (i of [1, 2, 3, 4, 5, 6]; track i) {
            <div class="skeleton stat-skeleton"></div>
          }
        </div>
      } @else {
        <!-- KPI Cards -->
        <div class="kpi-grid">
          <div class="kpi-card primary">
            <div class="kpi-icon">💰</div>
            <div class="kpi-value">
              KSh {{ data()?.summary?.totalRevenue | number: "1.0-0" }}
            </div>
            <div class="kpi-label">Total Revenue</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon">📦</div>
            <div class="kpi-value">{{ data()?.summary?.totalOrders }}</div>
            <div class="kpi-label">Total Orders</div>
          </div>
          <div class="kpi-card pos">
            <div class="kpi-icon">🏪</div>
            <div class="kpi-value">
              KSh {{ data()?.summary?.posRevenue | number: "1.0-0" }}
            </div>
            <div class="kpi-label">
              POS Revenue
              <span class="badge-count"
                >{{ data()?.summary?.posOrders }} orders</span
              >
            </div>
          </div>
          <div class="kpi-card online">
            <div class="kpi-icon">🌐</div>
            <div class="kpi-value">
              KSh {{ data()?.summary?.onlineRevenue | number: "1.0-0" }}
            </div>
            <div class="kpi-label">
              Online Revenue
              <span class="badge-count"
                >{{ data()?.summary?.onlineOrders }} orders</span
              >
            </div>
          </div>
          @if (data()?.summary?.totalOrders > 0) {
            <div class="kpi-card">
              <div class="kpi-icon">📈</div>
              <div class="kpi-value">
                KSh {{ avgOrderValue() | number: "1.0-0" }}
              </div>
              <div class="kpi-label">Avg Order Value</div>
            </div>
          }
        </div>

        <!-- POS vs Online Split -->
        @if (data()?.summary?.totalRevenue > 0) {
          <div class="split-section card">
            <h3>POS vs Online Revenue Split</h3>
            <div class="split-bar-wrap">
              <div class="split-bar">
                <div class="split-pos" [style.width.%]="posPercent()">
                  {{ posPercent() | number: "1.0-0" }}% POS
                </div>
                <div class="split-online" [style.width.%]="100 - posPercent()">
                  {{ 100 - posPercent() | number: "1.0-0" }}% Online
                </div>
              </div>
            </div>
            <div class="split-legend">
              <span class="legend-pos"
                >🏪 POS: KSh
                {{ data()?.summary?.posRevenue | number: "1.0-0" }}</span
              >
              <span class="legend-online"
                >🌐 Online: KSh
                {{ data()?.summary?.onlineRevenue | number: "1.0-0" }}</span
              >
            </div>
          </div>
        }

        <div class="two-col">
          <!-- Daily Revenue Chart -->
          <div class="card chart-card">
            <h3>Daily Revenue (Last 30 Days)</h3>
            @if (data()?.dailyChart?.length) {
              <div class="bar-chart">
                @for (day of data()?.dailyChart; track day.date) {
                  <div
                    class="bar-col"
                    [title]="
                      day.date + ': KSh ' + (day.revenue | number: '1.0-0')
                    "
                  >
                    <div
                      class="bar"
                      [style.height.%]="getBarHeight(day.revenue)"
                    >
                      <span class="bar-tip">{{
                        day.revenue | number: "1.0-0"
                      }}</span>
                    </div>
                    <span class="bar-label">{{ day.date | date: "d/M" }}</span>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-chart">No data for this period</div>
            }
          </div>

          <!-- Top Products -->
          <div class="card">
            <h3>🏆 Top Selling Products</h3>
            @if (data()?.topProducts?.length) {
              <div class="top-list">
                @for (p of data()?.topProducts; track p.name; let i = $index) {
                  <div class="top-item">
                    <div
                      class="top-rank"
                      [class.gold]="i === 0"
                      [class.silver]="i === 1"
                      [class.bronze]="i === 2"
                    >
                      {{ i + 1 }}
                    </div>
                    <div class="top-info">
                      <div class="top-name">{{ p.name }}</div>
                      <div class="top-meta">{{ p.sold }} units sold</div>
                    </div>
                    <div class="top-revenue">
                      KSh {{ p.revenue | number: "1.0-0" }}
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-chart">No sales data yet</div>
            }
          </div>
        </div>

        <div class="two-col">
          <!-- Staff Performance -->
          <div class="card">
            <h3>👤 Staff Sales Performance (POS)</h3>
            @if (data()?.staffStats?.length) {
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Transactions</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  @for (s of data()?.staffStats; track s.staffName) {
                    <tr>
                      <td>{{ s.staffName }}</td>
                      <td>
                        <span class="badge badge-neutral">{{
                          s.transactions
                        }}</span>
                      </td>
                      <td class="revenue-cell">
                        KSh {{ s.revenue | number: "1.0-0" }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <div class="empty-chart">No POS sales data</div>
            }
          </div>

          <!-- Low Stock Alerts -->
          <div class="card">
            <h3>⚠️ Low Stock Alert</h3>
            @if (data()?.lowStock?.length) {
              <div class="stock-list">
                @for (p of data()?.lowStock; track p.id) {
                  <div class="stock-item" [class.oos]="p.stockQuantity === 0">
                    <div class="stock-name">{{ p.name }}</div>
                    <div class="stock-badges">
                      <span
                        class="badge"
                        [class.badge-error]="p.stockQuantity === 0"
                        [class.badge-warning]="p.stockQuantity > 0"
                      >
                        {{
                          p.stockQuantity === 0
                            ? "Out of Stock"
                            : p.stockQuantity + " left"
                        }}
                      </span>
                      @if (!p.isAvailable) {
                        <span class="badge badge-error">Hidden</span>
                      }
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-chart text-success">
                ✅ All products are well-stocked
              </div>
            }
          </div>
        </div>

        <!-- Reports Section -->
        <div class="card reports-card">
          <h3>📋 Generate Reports</h3>
          <div class="report-controls">
            <div class="control-group">
              <label class="form-label">Report Type</label>
              <select class="form-select" [(ngModel)]="reportType">
                <option value="all">All Orders</option>
                <option value="pos">POS Orders Only</option>
                <option value="online">Online Orders Only</option>
              </select>
            </div>
            <div class="control-group">
              <label class="form-label">Start Date</label>
              <input class="form-input" type="date" [(ngModel)]="reportStart" />
            </div>
            <div class="control-group">
              <label class="form-label">End Date</label>
              <input class="form-input" type="date" [(ngModel)]="reportEnd" />
            </div>
            <button
              class="btn btn-primary"
              (click)="generateReport()"
              [disabled]="reportLoading()"
            >
              {{ reportLoading() ? "Generating..." : "📊 Generate" }}
            </button>
          </div>

          @if (report()) {
            <div class="report-result">
              <div class="report-summary">
                <div class="report-stat">
                  <span class="rs-label">Orders</span>
                  <span class="rs-value">{{ report()?.totalOrders }}</span>
                </div>
                <div class="report-stat">
                  <span class="rs-label">Revenue</span>
                  <span class="rs-value"
                    >KSh {{ report()?.totalRevenue | number: "1.0-0" }}</span
                  >
                </div>
                <div class="report-stat">
                  <span class="rs-label">Period</span>
                  <span class="rs-value"
                    >{{ report()?.startDate }} → {{ report()?.endDate }}</span
                  >
                </div>
                <button class="btn btn-outline" (click)="exportReportCsv()">
                  ⬇️ Export CSV
                </button>
                <button class="btn btn-outline" (click)="exportReportExcel()">
                  📊 Export Excel
                </button>
              </div>

              <div class="report-table-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Payment</th>
                      <th>Discount</th>
                      <th>Total</th>
                      <th>Staff</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (o of report()?.orders; track o.orderNumber) {
                      <tr>
                        <td>
                          <code>{{ o.orderNumber }}</code>
                        </td>
                        <td>
                          <span
                            class="badge"
                            [class.badge-pos]="o.orderType === 'pos'"
                            [class.badge-online]="o.orderType !== 'pos'"
                            >{{ o.orderType }}</span
                          >
                        </td>
                        <td>{{ o.date | date: "short" }}</td>
                        <td>{{ o.customer }}</td>
                        <td>{{ o.items }}</td>
                        <td>{{ o.paymentMethod }}</td>
                        <td>
                          {{
                            o.discount > 0
                              ? "-KSh " + (o.discount | number: "1.0-0")
                              : "—"
                          }}
                        </td>
                        <td class="revenue-cell">
                          KSh {{ o.total | number: "1.0-0" }}
                        </td>
                        <td>{{ o.processedBy }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>

        <!-- Cash Drawer -->
        <div class="card cash-card">
          <h3>💵 Cash Drawer Summary</h3>
          <div class="cash-controls">
            <input
              class="form-input"
              type="date"
              [(ngModel)]="cashDate"
              (change)="loadCashDrawer()"
            />
            <button class="btn btn-outline" (click)="loadCashDrawer()">
              Refresh
            </button>
          </div>
          @if (cashDrawer()) {
            <div class="cash-summary">
              <div class="cash-stat">
                <span class="cs-label">Cash Transactions</span>
                <span class="cs-value">{{ cashDrawer()?.transactions }}</span>
              </div>
              <div class="cash-stat">
                <span class="cs-label">Total Cash Sales</span>
                <span class="cs-value primary"
                  >KSh
                  {{ cashDrawer()?.totalCashSales | number: "1.0-0" }}</span
                >
              </div>
              <div class="cash-stat">
                <span class="cs-label">Total Tendered</span>
                <span class="cs-value"
                  >KSh {{ cashDrawer()?.totalTendered | number: "1.0-0" }}</span
                >
              </div>
              <div class="cash-stat">
                <span class="cs-label">Total Change Given</span>
                <span class="cs-value"
                  >KSh {{ cashDrawer()?.totalChange | number: "1.0-0" }}</span
                >
              </div>
            </div>
            @if (cashDrawer()?.orders?.length) {
              <table class="data-table" style="margin-top:16px">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Time</th>
                    <th>Total</th>
                    <th>Tendered</th>
                    <th>Change</th>
                    <th>Staff</th>
                  </tr>
                </thead>
                <tbody>
                  @for (o of cashDrawer()?.orders; track o.orderNumber) {
                    <tr>
                      <td>
                        <code>{{ o.orderNumber }}</code>
                      </td>
                      <td>{{ o.time | date: "shortTime" }}</td>
                      <td>KSh {{ o.total | number: "1.0-0" }}</td>
                      <td>KSh {{ o.tendered | number: "1.0-0" }}</td>
                      <td>KSh {{ o.change | number: "1.0-0" }}</td>
                      <td>{{ o.processedBy }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <p class="muted" style="margin-top:12px">
                No cash transactions on this date
              </p>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .analytics-page {
        padding: 24px;
        max-width: 1400px;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
      }
      .page-title {
        font-style: italic;
        font-size: 1.75rem;
        color: var(--color-text);
        margin: 0 0 4px;
      }
      .page-sub {
        color: var(--color-text-secondary);
        font-size: 0.875rem;
        margin: 0;
      }
      .header-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .loading-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }
      .stat-skeleton {
        height: 100px;
        border-radius: 12px;
      }

      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }
      .kpi-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        border: 1px solid var(--color-border);
        position: relative;
        overflow: hidden;
      }
      .kpi-card::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: #e8ddd5;
      }
      .kpi-card.primary::before {
        background: linear-gradient(90deg, #8b6f47, #c8956c);
      }
      .kpi-card.pos::before {
        background: #8b5cf6;
      }
      .kpi-card.online::before {
        background: #3b82f6;
      }
      .kpi-icon {
        font-size: 1.5rem;
        margin-bottom: 8px;
      }
      .kpi-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-text);
        line-height: 1;
      }
      .kpi-label {
        font-size: 0.75rem;
        color: var(--color-text-secondary);
        margin-top: 4px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .badge-count {
        background: #f0e8df;
        color: #8b6f47;
        padding: 1px 6px;
        border-radius: 10px;
        font-size: 0.7rem;
        font-weight: 600;
      }

      .card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        border: 1px solid var(--color-border);
        margin-bottom: 24px;
      }
      .card h3 {
        margin: 0 0 16px;
        font-size: 1rem;
        color: var(--color-text);
      }

      .split-section {
      }
      .split-bar-wrap {
        margin-bottom: 8px;
      }
      .split-bar {
        display: flex;
        height: 32px;
        border-radius: 8px;
        overflow: hidden;
      }
      .split-pos {
        background: #8b5cf6;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 0.75rem;
        font-weight: 700;
        transition: width 0.5s;
        min-width: fit-content;
        padding: 0 8px;
      }
      .split-online {
        background: #3b82f6;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 0.75rem;
        font-weight: 700;
        transition: width 0.5s;
        flex: 1;
        padding: 0 8px;
      }
      .split-legend {
        display: flex;
        gap: 16px;
        font-size: 0.8rem;
      }
      .legend-pos {
        color: #8b5cf6;
        font-weight: 600;
      }
      .legend-online {
        color: #3b82f6;
        font-weight: 600;
      }

      .two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-bottom: 24px;
      }

      .chart-card {
      }
      .bar-chart {
        display: flex;
        align-items: flex-end;
        gap: 3px;
        height: 160px;
        padding-bottom: 20px;
        overflow-x: auto;
      }
      .bar-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        flex-shrink: 0;
        width: 20px;
        height: 100%;
        justify-content: flex-end;
        position: relative;
      }
      .bar {
        background: linear-gradient(180deg, #c8956c, #8b6f47);
        border-radius: 3px 3px 0 0;
        width: 14px;
        min-height: 2px;
        transition: height 0.3s;
        position: relative;
        cursor: pointer;
      }
      .bar:hover {
        background: linear-gradient(180deg, #e0a87a, #a07850);
      }
      .bar-tip {
        position: absolute;
        top: -18px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.55rem;
        color: #7a5c44;
        white-space: nowrap;
        display: none;
      }
      .bar:hover .bar-tip {
        display: block;
      }
      .bar-label {
        font-size: 0.55rem;
        color: #a08060;
        position: absolute;
        bottom: 0;
      }
      .empty-chart {
        padding: 40px;
        text-align: center;
        color: var(--color-text-secondary);
        font-size: 0.875rem;
      }
      .text-success {
        color: #065f46 !important;
      }

      .top-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .top-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px;
        border-radius: 8px;
        background: #faf8f5;
      }
      .top-rank {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #e8ddd5;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 700;
        color: #7a5c44;
        flex-shrink: 0;
      }
      .top-rank.gold {
        background: #fbbf24;
        color: #3d2b1f;
      }
      .top-rank.silver {
        background: #9ca3af;
        color: white;
      }
      .top-rank.bronze {
        background: #d97706;
        color: white;
      }
      .top-info {
        flex: 1;
      }
      .top-name {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-text);
      }
      .top-meta {
        font-size: 0.75rem;
        color: var(--color-text-secondary);
      }
      .top-revenue {
        font-size: 0.875rem;
        font-weight: 700;
        color: #8b6f47;
      }

      .data-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.8rem;
      }
      .data-table th {
        padding: 8px 10px;
        text-align: left;
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-text-secondary);
        border-bottom: 2px solid var(--color-border);
      }
      .data-table td {
        padding: 8px 10px;
        border-bottom: 1px solid var(--color-border);
        color: var(--color-text);
      }
      .data-table tr:hover td {
        background: #faf8f5;
      }
      .revenue-cell {
        font-weight: 700;
        color: #8b6f47;
      }
      .badge-pos {
        background: #ede9fe;
        color: #5b21b6;
        font-size: 0.7rem;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 600;
      }
      .badge-online {
        background: #dbeafe;
        color: #1d4ed8;
        font-size: 0.7rem;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 600;
      }
      .badge-neutral {
        background: #f3f4f6;
        color: #6b7280;
        font-size: 0.7rem;
        padding: 2px 6px;
        border-radius: 4px;
      }
      code {
        font-family: monospace;
        font-size: 0.75rem;
        background: #f5f0eb;
        padding: 1px 4px;
        border-radius: 3px;
      }

      .stock-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .stock-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        border-radius: 8px;
        background: #faf8f5;
      }
      .stock-item.oos {
        background: #fee2e2;
      }
      .stock-name {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--color-text);
      }
      .stock-badges {
        display: flex;
        gap: 4px;
      }
      .badge-warning {
        background: #fef3c7;
        color: #92400e;
        font-size: 0.7rem;
        padding: 2px 7px;
        border-radius: 10px;
        font-weight: 600;
      }
      .badge-error {
        background: #fee2e2;
        color: #991b1b;
        font-size: 0.7rem;
        padding: 2px 7px;
        border-radius: 10px;
        font-weight: 600;
      }

      .reports-card .report-controls {
        display: flex;
        gap: 12px;
        align-items: flex-end;
        flex-wrap: wrap;
        margin-bottom: 16px;
      }
      .control-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .report-result {
        border-top: 1px solid var(--color-border);
        padding-top: 16px;
      }
      .report-summary {
        display: flex;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
        margin-bottom: 16px;
        padding: 12px;
        background: #faf8f5;
        border-radius: 8px;
      }
      .report-stat {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .rs-label {
        font-size: 0.7rem;
        color: var(--color-text-secondary);
        text-transform: uppercase;
      }
      .rs-value {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--color-text);
      }
      .report-table-wrap {
        overflow-x: auto;
      }
      .btn-outline {
        background: white;
        border: 1px solid var(--color-border);
        color: var(--color-text);
        padding: 7px 14px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.8rem;
      }
      .btn-outline:hover {
        border-color: #c8956c;
      }

      .cash-card .cash-controls {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 16px;
      }
      .cash-summary {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 12px;
        margin-bottom: 8px;
      }
      .cash-stat {
        background: #faf8f5;
        border-radius: 8px;
        padding: 12px;
      }
      .cs-label {
        font-size: 0.7rem;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        display: block;
        margin-bottom: 4px;
      }
      .cs-value {
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-text);
      }
      .cs-value.primary {
        color: #8b6f47;
      }
      .muted {
        color: var(--color-text-secondary);
        font-size: 0.875rem;
      }

      @media (max-width: 768px) {
        .two-col {
          grid-template-columns: 1fr;
        }
        .report-controls {
          flex-direction: column;
        }
        .kpi-grid {
          grid-template-columns: 1fr 1fr;
        }
      }
    `,
  ],
})
export class AnalyticsComponent implements OnInit {
  period = "month";
  loading = signal(true);
  data = signal<any>(null);
  report = signal<any>(null);
  cashDrawer = signal<any>(null);
  reportLoading = signal(false);
  reportType = "all";
  reportStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];
  reportEnd = new Date().toISOString().split("T")[0];
  cashDate = new Date().toISOString().split("T")[0];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadAnalytics();
    this.loadCashDrawer();
  }

  loadAnalytics() {
    this.loading.set(true);
    this.api.get<any>("/pos/analytics", { period: this.period }).subscribe({
      next: (d) => {
        this.data.set(d);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadCashDrawer() {
    this.api.get<any>("/pos/cash-drawer", { date: this.cashDate }).subscribe({
      next: (d) => this.cashDrawer.set(d),
      error: () => {},
    });
  }

  generateReport() {
    this.reportLoading.set(true);
    this.api
      .get<any>("/pos/reports", {
        type: this.reportType,
        startDate: this.reportStart,
        endDate: this.reportEnd,
      })
      .subscribe({
        next: (r) => {
          this.report.set(r);
          this.reportLoading.set(false);
        },
        error: () => this.reportLoading.set(false),
      });
  }

  avgOrderValue = computed(() => {
    const s = this.data()?.summary;
    if (!s?.totalOrders) return 0;
    return s.totalRevenue / s.totalOrders;
  });

  posPercent = computed(() => {
    const s = this.data()?.summary;
    if (!s?.totalRevenue) return 50;
    return Math.round((s.posRevenue / s.totalRevenue) * 100);
  });

  maxRevenue = computed(() => {
    const days = this.data()?.dailyChart || [];
    return Math.max(...days.map((d: any) => d.revenue), 1);
  });

  getBarHeight(revenue: number): number {
    return Math.max((revenue / this.maxRevenue()) * 100, 2);
  }

  exportReportCsv() {
    const r = this.report();
    if (!r?.orders?.length) return;
    const headers = [
      "Order #",
      "Type",
      "Date",
      "Customer",
      "Items",
      "Payment",
      "Discount",
      "Total",
      "Staff",
    ];
    const rows = r.orders.map((o: any) => [
      o.orderNumber,
      o.orderType,
      new Date(o.date).toLocaleDateString(),
      o.customer,
      o.items,
      o.paymentMethod,
      o.discount > 0 ? `-${o.discount}` : "0",
      o.total,
      o.processedBy,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v: any) => `"${v}"`).join(","))
      .join("\n");
    this.downloadFile(
      csv,
      `report-${r.startDate}-${r.endDate}.csv`,
      "text/csv",
    );
  }

  exportReportExcel() {
    const r = this.report();
    if (!r?.orders?.length) return;
    const headers = [
      "Order #",
      "Type",
      "Date",
      "Customer",
      "Items",
      "Payment",
      "Discount",
      "Total",
      "Staff",
    ];
    const rows = r.orders.map((o: any) => [
      o.orderNumber,
      o.orderType,
      new Date(o.date).toLocaleDateString(),
      o.customer,
      o.items,
      o.paymentMethod,
      o.discount > 0 ? -o.discount : 0,
      o.total,
      o.processedBy,
    ]);

    // Simple TSV that Excel opens natively
    const tsv = [headers, ...rows].map((r) => r.join("\t")).join("\n");
    this.downloadFile(
      tsv,
      `report-${r.startDate}-${r.endDate}.xls`,
      "application/vnd.ms-excel",
    );
  }

  private downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
