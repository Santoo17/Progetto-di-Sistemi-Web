export type OrderSort = '' | 'date_desc' | 'date_asc' | 'price_desc' | 'price_asc';
export type ProductSort = '' | 'price_desc' | 'price_asc';

export interface OrderFilters {
  status: string;
  sort: OrderSort;
}

export interface ProductFilters {
  title: string;
  tag: string;
  sort: ProductSort;
}
