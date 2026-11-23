import { Injectable, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product';
import { AuthService } from './auth';
import { CartItem, CartApi } from '../models/cart';
import { API_URL } from '../tokens/config';




@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = inject(API_URL) + '/cart';

  private readonly itemsSubject = new BehaviorSubject<CartItem[]>([]);
  readonly items$: Observable<CartItem[]> = this.itemsSubject.asObservable();

  constructor() {
    // carica il carrello al login/reload, lo svuota al logout
    effect(() => {
      if (this.auth.isLoggedIn()) this.load();
      else this.clear();
    });
  }

  load(): void {
    this.http.get<CartApi>(this.baseUrl).subscribe({
      next: cart => this.apply(cart),
      error: err => console.error('Errore caricamento carrello', err)
    });
  }

  add(product: Product, quantity = 1): void {
    if (!this.auth.getToken()) {
      this.router.navigate(['/login']);
      return;
    }
    this.http.post<CartApi>(`${this.baseUrl}/items`, { product_id: product.id, quantity })
      .subscribe({
        next: cart => this.apply(cart),
        error: err => console.error('Errore aggiunta al carrello', err)
      });
  }

  remove(productId: number): void {
    const item = this.snapshot.find(i => i.product.id === productId);
    if (!item) return;
    this.http.delete<CartApi>(`${this.baseUrl}/items/${item.id}`).subscribe({
      next: cart => this.apply(cart),
      error: err => console.error('Errore rimozione dal carrello', err)
    });
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    const item = this.snapshot.find(i => i.product.id === productId);
    if (!item) return;
    this.http.patch<CartApi>(`${this.baseUrl}/items/${item.id}`, { quantity }).subscribe({
      next: cart => this.apply(cart),
      error: err => console.error('Errore aggiornamento quantità', err)
    });
  }

  clear(): void {
    this.itemsSubject.next([]);
  }

  get snapshot(): CartItem[] {
    return this.itemsSubject.value;
  }

  private apply(cart: CartApi): void {
    this.itemsSubject.next(
      cart.items.map(i => ({
        id: i.id,
        quantity: i.quantity,
        product: {
          id: i.product_id,
          title: i.title,
          price: i.unit_price,
        }
      }))
    );
  }
}