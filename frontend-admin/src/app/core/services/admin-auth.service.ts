import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private _admin = signal<any | null>(null);
  private _token = signal<string | null>(null);

  admin = this._admin.asReadonly();
  isLoggedIn = computed(() => !!this._admin());

  constructor(private api: ApiService, private router: Router) {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const token = localStorage.getItem('cf_admin_token');
    const admin = localStorage.getItem('cf_admin');
    if (token && admin) {
      this._token.set(token);
      this._admin.set(JSON.parse(admin));
    }
  }

  getToken() { return this._token(); }

  login(email: string, password: string) {
    return this.api.post<any>('/auth/admin/login', { email, password }).pipe(
      tap(res => {
        localStorage.setItem('cf_admin_token', res.token);
        localStorage.setItem('cf_admin', JSON.stringify(res.admin));
        this._token.set(res.token);
        this._admin.set(res.admin);
      })
    );
  }

  logout() {
    localStorage.removeItem('cf_admin_token');
    localStorage.removeItem('cf_admin');
    this._token.set(null);
    this._admin.set(null);
    this.router.navigate(['/login']);
  }
}
