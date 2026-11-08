import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CartService, CartItem } from '../../../core/services/cart';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, NgFor, NgIf, RouterLink, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss'
})
export class CartPageComponent {
  private cart = inject(CartService);

  readonly items$: Observable<CartItem[]> = this.cart.items$;

  readonly total$: Observable<number> = this.items$.pipe(
    map(items => items.reduce((sum, i) => sum + i.product.prezzo * i.quantity, 0))
  );

  increase(item: CartItem): void {
    this.cart.updateQuantity(item.product.id, item.quantity + 1);
  }

  decrease(item: CartItem): void {
    this.cart.updateQuantity(item.product.id, item.quantity - 1);
  }

  remove(item: CartItem): void {
    this.cart.remove(item.product.id);
  }
}