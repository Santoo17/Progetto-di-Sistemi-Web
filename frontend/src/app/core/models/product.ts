export interface Product {
  id: number;
  title: string;
  description: string | null;
  price: number;
  tags: string[];
  thumbnail: string | null;
  createdAt: string;
}

export interface ProductCreate {
  title: string;
  description: string | null;
  price: number;
  tags: string[];
  thumbnail: string | null;
}

export interface ProductUpdate {
  title?: string;
  description?: string | null;
  price?: number;
  tags?: string[];
  thumbnail?: string | null;
}