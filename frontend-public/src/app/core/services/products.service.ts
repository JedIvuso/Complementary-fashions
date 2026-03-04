import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  constructor(private api: ApiService) {}

  getAll(params?: any) { return this.api.get<any>('/products', params); }
  getOne(id: string) { return this.api.get<any>(`/products/${id}`); }
  getRelated(id: string) { return this.api.get<any[]>(`/products/${id}/related`); }
  getFeatured() { return this.api.get<any[]>('/products/featured'); }
}
