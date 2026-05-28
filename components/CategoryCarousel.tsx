import { CategoryShowcase } from '@/components/CategoryShowcase';
import type { Category } from '@/types/index';

interface CategoryCarouselProps {
  categories: Category[];
}

export function CategoryCarousel({ categories }: CategoryCarouselProps) {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-y-4">
      {categories.map((category) => (
        <div key={category.id} className="w-full px-2 sm:w-1/2 lg:w-[25%]">
          <CategoryShowcase category={category} />
        </div>
      ))}
    </div>
  );
}
