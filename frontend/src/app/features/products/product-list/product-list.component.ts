import { Component, inject } from '@angular/core';
import { NgFor, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { BehaviorSubject, catchError, combineLatest, map, Observable, of, shareReplay, startWith } from 'rxjs';
import { Product } from '../../../core/models/product';
import { ProductsService } from '../../../core/services/products.service';
import { ProductCardComponent } from '../product-card/product-card.component';
import { HttpStateCard } from '../../../shared/http/http-state-card/http-state-card';
import { CartService } from '../../../core/services/cart';
import { HttpState } from '../../../shared/http/http-state';
import { AuthService } from '../../../core/services/auth';
import { RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [NgFor, AsyncPipe, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, ProductCardComponent, HttpStateCard, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent {
  private service = inject(ProductsService);
  private cart = inject(CartService);
  private auth = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private products$: Observable<Product[]> = this.service.list().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  protected filters = { title: '' };
  private filterTitle$ = new BehaviorSubject<string>('');
  readonly isAdmin = this.auth.isAdmin;

  state$: Observable<HttpState<Product[]>> = combineLatest([
    this.products$,
    this.filterTitle$
  ]).pipe(
    map(([products, title]) => {
      const t = title.trim().toLowerCase();
      const data = products.filter(p => !t || p.nome.toLowerCase().includes(t));
      return { status: 'success', data } as const;
    }),
    startWith({ status: 'loading' } as const),
    catchError(() => of({ status: 'error', message: 'Impossibile caricare i prodotti.' } as const))
  );

  trackById = (_: number, p: Product) => p.id;

  onAdd(p: Product) {
    this.cart.add(p);
    this.snackBar.open(`${p.nome} aggiunto al carrello`, 'Chiudi', {
    duration: 2500
  });
  }

  applyFilters() {
    this.filterTitle$.next(this.filters.title);
  }

  reload() {
    this.products$ = this.service.list().pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.filterTitle$.next(this.filters.title);
  }
}