import { Injectable, signal, computed } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { tap, catchError } from "rxjs/operators";
import { throwError } from "rxjs";
import { ApiService } from "./api.service";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(null);

  user = this._user.asReadonly();
  token = this._token.asReadonly();
  isLoggedIn = computed(() => !!this._user());
  isAdmin = computed(() => this._user()?.role === "admin");

  constructor(
    private api: ApiService,
    private router: Router,
  ) {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const token = localStorage.getItem("cf_token");
    const user = localStorage.getItem("cf_user");
    if (token && user) {
      this._token.set(token);
      this._user.set(JSON.parse(user));
    }
  }

  register(data: any) {
    return this.api
      .post<any>("/auth/register", data)
      .pipe(tap((res) => this.setSession(res)));
  }

  login(email: string, password: string) {
    return this.api
      .post<any>("/auth/login", { email, password })
      .pipe(tap((res) => this.setSession(res)));
  }

  logout() {
    localStorage.removeItem("cf_token");
    localStorage.removeItem("cf_user");
    this._user.set(null);
    this._token.set(null);
    this.router.navigate(["/"]);
  }

  private setSession(res: { token: string; user: User }) {
    localStorage.setItem("cf_token", res.token);
    localStorage.setItem("cf_user", JSON.stringify(res.user));
    this._token.set(res.token);
    this._user.set(res.user);
  }

  getProfile() {
    return this.api.get<User>("/auth/profile").pipe(
      tap((user) => {
        this._user.set(user);
        localStorage.setItem("cf_user", JSON.stringify(user));
      }),
    );
  }

  updateTheme(theme: string) {
    return this.api.put("/auth/theme", { theme });
  }
}
