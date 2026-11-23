export interface CheckoutRequest {
  shipping_address: string;
  city: string;
  postal_code: string;
}

export interface OrderItemRead {
  id: number;
  product_id: number;
  title: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface OrderRead {
  id: number;
  status: string;
  total: number;
  created_at: string;
  shipping_address: string;
  city: string;
  postal_code: string;
  items: OrderItemRead[];
}