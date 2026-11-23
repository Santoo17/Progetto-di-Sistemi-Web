import { Product } from '../models/product';

export interface CartItem {
  id: number;
  product: Pick<Product, 'id' | 'title' | 'price' >;
  quantity: number;
}

export interface CartItemApi {
  id: number;
  product_id: number;
  title: string;
  thumbnail: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface CartApi {
  id: number;
  items: CartItemApi[];
  total: number;
}