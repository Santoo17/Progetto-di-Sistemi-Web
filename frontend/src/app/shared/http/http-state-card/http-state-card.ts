import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { HttpState }from '../../../core/models/http-state-cards';

@Component({
  selector: 'app-http-state-card',
  standalone: true,
  imports: [MatProgressSpinnerModule, MatCardModule, MatButtonModule],
  templateUrl: './http-state-card.html'
})
export class HttpStateCard {
  @Input() state: HttpState<unknown> | null = null;
  @Output() retry = new EventEmitter<void>();

  onRetry(): void {
    this.retry.emit();
  }
}