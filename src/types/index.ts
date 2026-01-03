export interface Product {
  id: string;
  name: string;
  nameHindi?: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  artisan?: string;
  village?: string;
  state?: string;
  inStock: boolean;
  rating?: number;
  reviews?: number;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  nameHindi?: string;
  description: string;
  image: string;
  productCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
