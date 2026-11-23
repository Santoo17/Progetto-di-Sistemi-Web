import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h2>Pagina non trovata</h2>
    <a routerLink="/products">Torna ai prodotti</a>
  `,
})
export class NotFoundComponent {}