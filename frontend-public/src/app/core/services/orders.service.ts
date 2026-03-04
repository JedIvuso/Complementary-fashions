import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  constructor(private api: ApiService) {}

  create(deliveryDetails: any) {
    return this.api.post<any>('/orders', deliveryDetails);
  }

  getMyOrders() {
    return this.api.get<any[]>('/orders/my-orders');
  }

  getOne(id: string) {
    return this.api.get<any>(`/orders/my-orders/${id}`);
  }
}
