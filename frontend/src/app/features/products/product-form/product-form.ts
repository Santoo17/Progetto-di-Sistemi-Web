import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ProductsService } from '../../../core/services/products.service';
import { ProductCreate } from '../../../core/models/product';

const integer = (c: AbstractControl): ValidationErrors | null =>
  c.value === null || Number.isInteger(c.value) ? null : { integer: true };

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss'
})
export class ProductForm {
  private fb = inject(FormBuilder);
  private products = inject(ProductsService);
  private router = inject(Router);

  error: string | null = null;
  loading = false;

  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.pattern(/\S/)]],
    descrizione: [''],
    prezzo: [null as number | null, [Validators.required, Validators.min(0.01)]],
    giacenza: [0 as number | null, [Validators.required, Validators.min(0), integer]]
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error = null;
    this.loading = true;

    const v = this.form.getRawValue();
    const payload: ProductCreate = {
      nome: v.nome.trim(),
      descrizione: v.descrizione.trim() || null,
      prezzo: v.prezzo!,
      giacenza: v.giacenza!
    };

    this.products.create(payload).subscribe({
      next: () => this.router.navigate(['/products']),
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.error = this.messageFrom(err);
      }
    });
  }

  private messageFrom(err: HttpErrorResponse): string {
    if (err.status === 0) return 'Server non raggiungibile.';
    if (err.status === 401 || err.status === 403) return 'Non hai i permessi per aggiungere prodotti.';
    const detail = err.error?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail[0]?.msg) {
      return String(detail[0].msg).replace(/^Value error, /, '');
    }
    return 'Impossibile salvare il prodotto.';
  }
}