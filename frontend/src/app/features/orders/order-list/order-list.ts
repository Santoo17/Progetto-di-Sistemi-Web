import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe} from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { Observable, catchError, combineLatest, map, of, shareReplay, startWith, switchMap } from 'rxjs';
import { OrderService } from '../../../core/services/order';
import { OrderRead } from '../../../core/models/order';
import { BehaviorSubject } from 'rxjs';
import { OrderFilters } from '../../../core/models/filter';
import { HttpState } from '../../../core/models/http-state-cards';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { HttpStateCard } from '../../../shared/http/http-state-card/http-state-card';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    AsyncPipe,
    HttpStateCard,
    CurrencyPipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatChipsModule,
    DatePipe,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss'
})
export class OrderList {
  private readonly orderService = inject(OrderService);
  protected filters: OrderFilters = { status: '', sort: '' };
  private filters$ = new BehaviorSubject<OrderFilters>({ ...this.filters });
  private reload$ = new BehaviorSubject<void>(undefined);

  // Caricamento (loading / success / error), condiviso tra statuses$ e state$
  private result$: Observable<HttpState<OrderRead[]>> = this.reload$.pipe(
    switchMap(() =>
      this.orderService.list().pipe(
        map((data) => ({ status: 'success', data } as const)),
        startWith({ status: 'loading' } as const),
        catchError(() =>
          of({ status: 'error', message: 'Impossibile caricare gli ordini.' } as const)
        )
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // stati disponibili, ricavati dagli ordini caricati
  statuses$: Observable<string[]> = this.result$.pipe(
    map((s) => {
      if (s.status !== 'success') return [];
      const set = new Set<string>();
      s.data.forEach((p) => set.add(p.status));
      return Array.from(set).sort();
    })
  );

  // Dati filtrati e ordinati
  state$: Observable<HttpState<OrderRead[]>> = combineLatest([
    this.result$,
    this.filters$,
  ]).pipe(
    map(([s, f]) =>
      s.status === 'success' ? { ...s, data: this.filterOrders(s.data, f) } : s
    )
  );

  private filterOrders(orders: OrderRead[], f: OrderFilters): OrderRead[] {
    const status = f.status.trim().toLowerCase();
    const filtered = orders.filter(
      (o) => !status || o.status.toLowerCase().includes(status)
    );

    // copia, per non mutare l'array originale condiviso da shareReplay
    return [...filtered].sort((a, b) => {
      switch (f.sort) {
        case 'date_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'date_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'price_asc':
          return Number(a.total) - Number(b.total);
        case 'price_desc':
          return Number(b.total) - Number(a.total);
        default:
          return 0;
      }
    });
  }

  applyFilters() {
    this.filters$.next({ ...this.filters });
  }

  reload() {
    this.reload$.next();
  }
}