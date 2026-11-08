import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductCreate } from '../models/product';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000';

  list(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products/`);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  create(data: ProductCreate): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/products`, data);
  }

}