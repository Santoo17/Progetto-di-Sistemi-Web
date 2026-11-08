export interface CheckoutItem {
  product_id: number;
  quantita: number;
}

export interface CheckoutRequest {
  items: CheckoutItem[];
  codice_sconto?: string | null;
}

export interface OrderItemRead {
  id: number;
  product_id: number;
  quantita: number;
  prezzo_unitario: number;
}

export interface OrderRead {
  id: number;
  user_id: number;
  totale: number;
  stato: string;
  codice_sconto: string | null;
  items: OrderItemRead[];
}