export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  category_id: string | null;
  image_url: string;
  additional_images: string[];
  sizes: string[];
  colors: string[];
  stock_quantity: number;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_trending: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  status: string;
  order_items: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  pincode: string | null;
  created_at?: string;
  updated_at?: string;
}
