import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs';
import { Product } from '../../../core/models/product';
import { ProductsService } from '../../../core/services/products';
import { ProductCardComponent } from '../product-card/product-card';
import { HttpStateCard } from '../../../shared/http/http-state-card/http-state-card';
import { CartService } from '../../../core/services/cart';
import { HttpState } from '../../../core/models/http-state-cards';
import { AuthService } from '../../../core/services/auth';
import { ProductFilters } from '../../../core/models/filter';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    ProductCardComponent,
    HttpStateCard,
    RouterLink,
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductListComponent {
  private service = inject(ProductsService);
  private cart = inject(CartService);
  private auth = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  protected filters: ProductFilters = { title: '', tag: "", sort: '' };
  private filters$ = new BehaviorSubject<ProductFilters>({ ...this.filters });
  private reload$ = new BehaviorSubject<void>(undefined);

  readonly isAdmin = this.auth.isAdmin;

  // Caricamento (loading / success / error), condiviso tra tags$ e state$
  private result$: Observable<HttpState<Product[]>> = this.reload$.pipe(
    switchMap(() =>
      this.service.list().pipe(
        map((data) => ({ status: 'success', data } as const)),
        startWith({ status: 'loading' } as const),
        catchError(() =>
          of({ status: 'error', message: 'Impossibile caricare i prodotti.' } as const)
        )
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // Tag disponibili, ricavati dai prodotti caricati
  tags$: Observable<string[]> = this.result$.pipe(
    map((s) => {
      if (s.status !== 'success') return [];
      const set = new Set<string>();
      s.data.forEach((p) => p.tags?.forEach((t) => set.add(t)));
      return Array.from(set).sort();
    })
  );

  // Dati filtrati
  state$: Observable<HttpState<Product[]>> = combineLatest([
    this.result$,
    this.filters$,
  ]).pipe(
    map(([s, f]) =>
      s.status === 'success' ? { ...s, data: this.filterProducts(s.data, f) } : s
    )
  );

  private filterProducts(products: Product[], f: ProductFilters): Product[] {
    const title = f.title.trim().toLowerCase();
    const filtered = products.filter(
      (p) =>
        (!title || p.title.toLowerCase().includes(title)) &&
        (!f.tag || p.tags?.includes(f.tag))
    );
    return [...filtered].sort((a, b) => {
      switch (f.sort) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        default:
          return 0;
      }
    });
  }

  onAdd(p: Product) {
    if (!this.auth.isLoggedIn()) {
      this.snackBar.open('Devi essere loggato per aggiungere prodotti al carrello', 'Chiudi', { duration: 2500 });
      this.cart.add(p);
      return;
    }
    this.cart.add(p);
    this.snackBar.open(`${p.title} aggiunto al carrello`, 'Chiudi', { duration: 2500 });
  }

applyFilters() {
  this.filters$.next({ ...this.filters });
}

reload() {
  this.reload$.next();
}

}