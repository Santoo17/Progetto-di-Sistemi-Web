import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { Observable, map, take } from 'rxjs';
import { CartService, CartItem } from '../../../core/services/cart';
import { OrderService } from '../../../core/services/order';
import { CheckoutRequest, OrderRead } from '../../../core/models/order';
import { UserService } from '../../../core/services/user';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    AsyncPipe,
    CurrencyPipe,
    NgFor,
    NgIf
  ],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.scss'
})
export class CheckoutPage {
  private fb = inject(FormBuilder);
  private cart = inject(CartService);
  private orderService = inject(OrderService);
  private userService = inject(UserService);
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
    map(items => items.reduce((sum, i) => sum + i.product.prezzo * i.quantity, 0))
  );
  readonly availableBalance$: Observable<number> =
  this.userService.getMe().pipe(map(u => u.saldo));

  readonly form = this.fb.group({
    address: this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      zip: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]]
    }),
    shippingMethod: ['standard', Validators.required],
    privacy: [false, Validators.requiredTrue],
    discountCode: ['']
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

    this.items$.pipe(take(1)).subscribe(items => {
      const request: CheckoutRequest = {
        items: items.map(i => ({
          product_id: i.product.id,
          quantita: i.quantity
        })),
        codice_sconto: value.discountCode?.trim() || null
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
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.loading.set(false);
          this.orderError.set(true);
          const detail = err?.error?.detail;
          this.orderErrorMessage.set(
            typeof detail === 'string'
              ? detail
              : 'Si è verificato un errore durante l\'invio dell\'ordine.'
          );
        }
      });
    });
  }
}