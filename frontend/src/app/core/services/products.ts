import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductUpdate, ProductCreate } from '../models/product';
import { API_URL } from '../tokens/config';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_URL);

  list(filters: { q?: string; tag?: string } = {}): Observable<Product[]> {
    let params = new HttpParams();
    if (filters.q) params = params.set('q', filters.q);
    if (filters.tag) params = params.set('tag', filters.tag);
    return this.http.get<Product[]>(`${this.baseUrl}/products`, { params });
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  create(data: FormData): Observable<ProductCreate> {
    return this.http.post<ProductCreate>(`${this.baseUrl}/products`, data);
  }

  update(id: number, data: FormData): Observable<ProductUpdate> {
    return this.http.patch<ProductUpdate>(`${this.baseUrl}/products/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/products/${id}`);
  }
}