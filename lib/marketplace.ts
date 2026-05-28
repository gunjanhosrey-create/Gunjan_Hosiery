import {
  BadgePercent,
  Baby,
  Boxes,
  Flame,
  PackageCheck,
  Shirt,
  Sparkles,
  Store,
  Truck,
  Umbrella,
} from 'lucide-react';
import type { Product } from '@/types';

export const rupee = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export const marketplaceCategories = [
  { label: 'Men', slug: 'men', icon: Shirt, href: '/products?category=men' },
  { label: 'Women', slug: 'women', icon: Sparkles, href: '/products?category=women' },
  { label: 'Kids', slug: 'kids', icon: Baby, href: '/products?category=kids' },
  { label: 'Innerwear', slug: 'innerwear', icon: PackageCheck, href: '/products?q=innerwear' },
  { label: 'Thermals', slug: 'thermal', icon: Umbrella, href: '/products?category=thermal' },
  { label: 'Bulk Buy', slug: 'bulk', icon: Boxes, href: '/products?category=value-pack' },
  { label: 'Deals', slug: 'deals', icon: Flame, href: '/products?sale=true' },
  { label: 'B2B GST', slug: 'b2b', icon: Store, href: '/login' },
];

export const searchSuggestions = [
  'boys t-shirt combo',
  'cotton vest pack',
  'girls leggings',
  'thermal wear wholesale',
  'kids hosiery set',
  'bulk innerwear GST invoice',
];

export const trustBadges = [
  { label: 'Secure Payments', detail: 'Razorpay, UPI, COD', icon: BadgePercent },
  { label: 'Verified Seller', detail: 'GST invoice available', icon: Store },
  { label: 'Easy Returns', detail: 'Quick support on orders', icon: PackageCheck },
  { label: 'Fast Dispatch', detail: 'Bulk orders supported', icon: Truck },
];

export const getMrp = (price: number) => Math.round(price * 1.55);

export const getDiscount = (price: number) =>
  Math.max(18, Math.round(((getMrp(price) - price) / getMrp(price)) * 100));

export const getRating = (product: Pick<Product, 'id' | 'price'>) => {
  const seed = product.id.charCodeAt(0) + Math.round(product.price);
  return Number((4.1 + (seed % 8) / 10).toFixed(1));
};

export const getReviewCount = (product: Pick<Product, 'id' | 'price'>) =>
  120 + ((product.id.length * 37 + Math.round(product.price)) % 2400);

export const isBulkProduct = (product: Product) =>
  `${product.name} ${product.description ?? ''} ${product.slug}`
    .toLowerCase()
    .match(/bulk|pack|combo|set|wholesale|dozen|value/);

export const isGstProduct = (product: Product) =>
  isBulkProduct(product) || product.price >= 500;
