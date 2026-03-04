import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BannersService {
  private url = `${environment.apiUrl}/banners`;

  constructor(private http: HttpClient) {}

  getActiveBanners() {
    return this.http.get<any[]>(`${this.url}?active=true`);
  }
}
