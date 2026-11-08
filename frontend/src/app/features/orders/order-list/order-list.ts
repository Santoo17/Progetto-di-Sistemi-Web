import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { Observable, catchError, of } from 'rxjs';
import { OrderService } from '../../../core/services/order';
import { OrderRead } from '../../../core/models/order';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    AsyncPipe,
    CurrencyPipe,
    NgFor,
    NgIf,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatChipsModule
  ],
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss'
})
export class OrderList {
  private readonly orderService = inject(OrderService);

  // Recupera lo storico degli ordini (assicurati che getOrders() esista nel tuo OrderService)
  readonly orders$: Observable<OrderRead[]> = this.orderService.list().pipe(
    catchError(err => {
      console.error('Errore durante il caricamento degli ordini', err);
      return of([]);
    })
  );
}