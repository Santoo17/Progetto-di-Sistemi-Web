import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { map, switchMap } from 'rxjs';
import { ProductsService } from '../../../core/services/products';
import { AuthService } from '../../../core/services/auth';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../../core/services/cart';
import { Product } from '../../../core/models/product';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(ProductsService);
  protected auth = inject(AuthService);
  private cart = inject(CartService);
  private snackBar = inject(MatSnackBar);
  readonly isAdmin = this.auth.isAdmin;

  readonly deleting = signal(false);
  readonly error = signal<string | null>(null);

  readonly product$ = this.route.paramMap.pipe(
    map(params => Number(params.get('id'))),
    switchMap(id => this.service.getById(id))
  );
    onAdd(product: Product) {
    if (!this.auth.isLoggedIn()) {
      this.snackBar.open('Devi essere loggato per aggiungere prodotti al carrello', 'Chiudi', { duration: 2500 });
      this.cart.add(product);
      return;
    }
      this.cart.add(product);
      this.snackBar.open(`${product.title} aggiunto al carrello`, 'Chiudi', { duration: 2500 });
    }
  onDelete(product: { id: number; title: string }): void {
    if (!confirm(`Eliminare "${product.title}"? L'operazione non è reversibile.`)) return;

    this.deleting.set(true);
    this.error.set(null);

    this.service.delete(product.id).subscribe({
      next: () => this.router.navigate(['/products']),
      error: (err: HttpErrorResponse) => {
        this.deleting.set(false);
        this.error.set(this.deleteErrorMessage(err));
      }
    });


  }

  private deleteErrorMessage(err: HttpErrorResponse): string {
    switch (err.status) {
      case 0:
        return 'Server non raggiungibile.';
      case 401:
      case 403:
        return 'Non hai i permessi per eliminare prodotti.';
      case 404:
        return 'Prodotto non trovato.';
      case 422:
        return 'Il prodotto è presente in uno o più ordini e non può essere eliminato.';
      default:
        return 'Impossibile eliminare il prodotto.';
    }
  }
}