import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CheckoutRequest, OrderRead } from '../models/order';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000';

  checkout(request: CheckoutRequest): Observable<OrderRead> {
    return this.http.post<OrderRead>(`${this.baseUrl}/checkout`, request);
  }

    list(): Observable<OrderRead[]> {
      return this.http.get<OrderRead[]>(`${this.baseUrl}/orders/`);
    }
}