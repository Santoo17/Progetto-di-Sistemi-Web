import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly itemsSubject = new BehaviorSubject<CartItem[]>([]);

  readonly items$: Observable<CartItem[]> = this.itemsSubject.asObservable();

  add(product: Product, quantity = 1): void {
    const current = this.itemsSubject.value;
    const existing = current.find(i => i.product.id === product.id);

    if (existing) {
      const updated = current.map(i =>
        i.product.id === product.id
          ? { ...i, quantity: i.quantity + quantity }
          : i
      );
      this.itemsSubject.next(updated);
    } else {
      this.itemsSubject.next([...current, { product, quantity }]);
    }
    
  }

  remove(productId: number): void {
    this.itemsSubject.next(
      this.itemsSubject.value.filter(i => i.product.id !== productId)
    );
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    this.itemsSubject.next(
      this.itemsSubject.value.map(i =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    );
  }

  clear(): void {
    this.itemsSubject.next([]);
  }

  get snapshot(): CartItem[] {
    return this.itemsSubject.value;
  }
  
}