import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private _favorites = signal<any[]>([]);
  favorites = this._favorites.asReadonly();

  constructor(private api: ApiService) {}

  load() { return this.api.get<any[]>('/favorites').pipe(tap(f => this._favorites.set(f))); }

  getFavorites() { return this.api.get<any[]>('/favorites').pipe(tap(f => this._favorites.set(f))); }

  toggle(productId: string) {
    return this.api.post<any>(`/favorites/${productId}/toggle`, {}).pipe(
      tap(() => this.load().subscribe())
    );
  }

  isFavorited(productId: string) { return this._favorites().some((f: any) => f.productId === productId); }
}
