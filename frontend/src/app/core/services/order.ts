import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CheckoutRequest, OrderRead } from '../models/order';
import { API_URL } from '../tokens/config'; 

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_URL);

  checkout(request: CheckoutRequest): Observable<OrderRead> {
    return this.http.post<OrderRead>(`${this.baseUrl}/orders`, request);
  }

  list(): Observable<OrderRead[]> {
    return this.http.get<OrderRead[]>(`${this.baseUrl}/orders`);
  }

  getById(id: number): Observable<OrderRead> {
    return this.http.get<OrderRead>(`${this.baseUrl}/orders/${id}`);
  }

  updateStatus(id: number, status: string): Observable<OrderRead> {
    return this.http.patch<OrderRead>(`${this.baseUrl}/orders/${id}`, { status });
  }
}