import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe, CurrencyPipe, NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { map, switchMap } from 'rxjs';
import { ProductsService } from '../../../core/services/products.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, NgIf, RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetail {
  private route = inject(ActivatedRoute);
  private service = inject(ProductsService);

  readonly product$ = this.route.paramMap.pipe(
    map(params => Number(params.get('id'))),
    switchMap(id => this.service.getById(id))
  );
}