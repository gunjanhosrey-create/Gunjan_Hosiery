import { Link } from 'react-router-dom';
import type { Category } from '@/types/index';

interface CategoryShowcaseProps {
  category: Category;
  previewImageUrl?: string | null;
}

const categoryFallbacks: Record<string, string> = {
  men: 'from-slate-900 via-slate-700 to-slate-900',
  women: 'from-stone-950 via-neutral-700 to-[#c6a85a]',
  kids: 'from-cyan-700 via-blue-700 to-slate-900',
  boys: 'from-sky-700 via-indigo-700 to-slate-900',
  girls: 'from-fuchsia-700 via-pink-700 to-slate-900',
};

export function CategoryShowcase({ category, previewImageUrl }: CategoryShowcaseProps) {
  const gradient = categoryFallbacks[category.slug] ?? 'from-slate-900 via-slate-700 to-slate-900';
  const displayImage = previewImageUrl || category.image_url;
  const hasImage = Boolean(displayImage);

  return (
    <Link to={`/products?category=${category.slug}`}>
      <div className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
        <div className="relative min-h-[220px] overflow-hidden bg-secondary sm:min-h-[240px]">
          {hasImage ? (
            <img
              src={displayImage as string}
              alt={category.name}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-5">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1 md:text-2xl">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-xs text-white/80 leading-tight md:text-sm">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
