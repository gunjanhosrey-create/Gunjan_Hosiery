import { Product3DCard } from '@/components/Product3DCard';
import type { Product } from '@/types/index';

interface ProductCarouselProps {
  products: Product[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <Product3DCard key={product.id} product={product} />
      ))}
    </div>
  );
}
