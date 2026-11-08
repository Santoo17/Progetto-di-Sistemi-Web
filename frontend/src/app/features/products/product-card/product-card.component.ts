import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../../core/models/product';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title>{{ product.nome }}</mat-card-title>
        <mat-card-subtitle>{{ product.prezzo | currency:'EUR' }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p class="stock" [class.stock-empty]="product.giacenza === 0">
          {{ product.giacenza > 0 ? product.giacenza + ' disponibili' : 'Esaurito' }}
        </p>
        <ng-content></ng-content>
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-button [routerLink]="['/products', product.id]">
          Dettagli
        </button>
        <button
          mat-flat-button
          color="primary"
          [disabled]="product.giacenza === 0"
          (click)="add.emit(product)"
        >
          <mat-icon aria-hidden="true">add_shopping_cart</mat-icon>
          Aggiungi
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    mat-card { max-width: 320px; }
    .stock {
      font-size: 0.85rem;
      color: rgba(0, 0, 0, 0.6);
      margin: 0 0 0.5rem;
    }
    .stock-empty {
      color: #d32f2f;
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() add = new EventEmitter<Product>();
}