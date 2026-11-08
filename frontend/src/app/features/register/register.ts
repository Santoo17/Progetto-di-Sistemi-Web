import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  error: string | null = null;
  loading = false;

  readonly form = this.fb.group({
    nome: ['', Validators.required],
    cognome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    indirizzo: ['']
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error = null;
    this.loading = true;

    const value = this.form.getRawValue();

    this.auth.register({
      nome: value.nome!,
      cognome: value.cognome!,
      email: value.email!,
      password: value.password!,
      indirizzo: value.indirizzo || null
    }).subscribe({
      next: () => {
        // Dopo la registrazione, esegui subito il login automatico
        this.auth.login(value.email!, value.password!).subscribe({
          next: () => {
            this.router.navigate(['/products']);
          },
          error: () => {
            this.loading = false;
            this.router.navigate(['/login']); // fallback: vai al login manuale
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.detail || 'Registrazione fallita. Riprova.';
      }
    });
  }
}