import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  constructor(private api: ApiService) {}
  getAll() { return this.api.get<any[]>('/categories'); }
  getOne(id: string) { return this.api.get<any>(`/categories/${id}`); }
}
