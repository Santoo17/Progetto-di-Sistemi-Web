import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ProductsService } from '../../../core/services/products';
import { signal } from '@angular/core';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss'
})
export class ProductForm implements OnInit {
  private fb = inject(FormBuilder);
  private products = inject(ProductsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);



  productId: number | null = null;
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);
  imageFile: File | null = null;


  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.pattern(/\S/)]],
    description: [''],
    price: [null as number | null, [Validators.required, Validators.min(0.01)]],
    tags: ['']
  });

  

  get isEditMode(): boolean {
    return this.productId !== null;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.productId = Number(id);
    this.loading.set(true);
    this.products.getById(this.productId).subscribe({
      next: p => {
        this.form.patchValue({
          title: p.title,
          description: p.description ?? '',
          price: p.price,
          tags: p.tags.join(', ')
        });
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set("prodotto non trovato");
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imageFile = input.files?.[0] ?? null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.loading.set(true);

    const v = this.form.getRawValue();
    const data = new FormData();
    data.append('title', v.title.trim());
    if (v.description.trim()) data.append('description', v.description.trim());
    data.append('price', String(v.price));
    v.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .forEach(t => data.append('tags[]', t));

    // Il nome del campo ('image') deve coincidere con quello atteso dal backend.
    if (this.imageFile) data.append('image', this.imageFile);

    const request$ = this.productId !== null
      ? this.products.update(this.productId, data)
      : this.products.create(data);

    request$.subscribe({
      next: () => this.router.navigate(['/products']),
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(this.messageFrom(err));
      }
    });
  }


  onDelete(): void {
    if (this.productId === null) return;
    if (!confirm('Eliminare questo prodotto? L\'operazione non è reversibile.')) return;
 
    this.error.set(null);
    this.loading.set(true);
 
    this.products.delete(this.productId).subscribe({
      next: () => this.router.navigate(['/products']),
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(
          err.status === 401 || err.status === 403
            ? 'Non hai i permessi per eliminare prodotti.'
            : err.status === 404
              ? 'Prodotto non trovato.'
              : 'Impossibile eliminare il prodotto.'
        );
      }
    });
  }

  private messageFrom(err: HttpErrorResponse): string {
    if (err.status === 0) return 'Server non raggiungibile.';
    if (err.status === 401 || err.status === 403) return 'Non hai i permessi per aggiungere prodotti.';
    const body = err.error;
    if (Array.isArray(body?.errors)) return body.errors.join(' ');
    if (typeof body?.error === 'string') return body.error;
    return 'Impossibile salvare il prodotto.';
  }
}