import { Component, input, inject } from '@angular/core';
import { TitleCasePipe, NgIf, AsyncPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { Observable, map } from 'rxjs';
import { CartService } from '../../core/services/cart';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-header',
  imports: [
    NgIf,
    AsyncPipe,
    TitleCasePipe,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  title = input<string>('Shop');
  showIcon = input<boolean>(true);

  private cart = inject(CartService);
  private router = inject(Router);
  auth = inject(AuthService);

  readonly cartCount$: Observable<number> = this.cart.items$.pipe(
    map(items => items.reduce((sum, i) => sum + i.quantity, 0))
  );

  toggleLogin(): void {
    if (this.auth.isLoggedIn()) {
      this.auth.logout();
    } else {
      this.router.navigate(['/login']);
    }
  }

  toggleOrders(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/orders']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}