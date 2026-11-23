import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Observable, map } from 'rxjs';
import { CartService } from '../../../core/services/cart';
import { CartItem } from '../../../core/models/cart';
import { OrderService } from '../../../core/services/order';
import { CheckoutRequest, OrderRead } from '../../../core/models/order';
import { MatCardModule } from '@angular/material/card';


@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    AsyncPipe,
    CurrencyPipe
  ],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.scss'
})
export class CheckoutPage {
  private fb = inject(FormBuilder);
  private cart = inject(CartService);
  private orderService = inject(OrderService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  loading = signal(false);
  orderError = signal(false);
  orderErrorMessage = signal('');

  orderSuccess = false;
  showSummary = false;
  lastOrder: OrderRead | null = null;

  readonly items$: Observable<CartItem[]> = this.cart.items$;

  readonly total$: Observable<number> = this.items$.pipe(
    map(items => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0))
  );

  readonly form = this.fb.group({
    address: this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      zip: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]]
    }),
    shippingMethod: ['standard', Validators.required],
    privacy: [false, Validators.requiredTrue]
  });

  getControl(path: string) {
    return this.form.get(path);
  }

  hasError(path: string, errorCode: string): boolean {
    const control = this.getControl(path);
    return !!control && control.hasError(errorCode) && control.touched;
  }

  private focusFirstInvalid(): void {
    const firstInvalid = document.querySelector(
      'form .ng-invalid[formControlName]'
    ) as HTMLElement | null;
    firstInvalid?.focus();
  }

  onSubmit(): void {
    if (this.loading()) return;

    if (this.form.invalid || this.cart.snapshot.length === 0) {
      this.form.markAllAsTouched();
      this.showSummary = true;
      this.focusFirstInvalid();
      return;
    }

    this.showSummary = false;
    this.loading.set(true);
    this.orderSuccess = false;
    this.orderError.set(false);

    const value = this.form.getRawValue();

    const request: CheckoutRequest = {
      shipping_address: value.address.street!,
      city: value.address.city!,
      postal_code: value.address.zip!
    };

    this.orderService.checkout(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.cart.clear();
        this.form.reset({ shippingMethod: 'standard', privacy: false });
        this.snackBar.open('Ordine inviato con successo!', 'Chiudi', {
          duration: 4000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.loading.set(false);
        this.orderError.set(true);
        const body = err?.error;
        const message = Array.isArray(body?.errors) ? body.errors.join(' ') : body?.error;
        this.orderErrorMessage.set(
          message ?? "Si è verificato un errore durante l'invio dell'ordine."
        );
      }
    });
  }
}