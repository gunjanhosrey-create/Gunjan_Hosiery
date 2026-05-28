import { Link, useNavigate } from 'react-router-dom';
import { BadgeCheck, Heart, ShoppingCart, Star, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getDiscount, getMrp, getRating, getReviewCount, isBulkProduct, isGstProduct, rupee } from '@/lib/marketplace';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import type { Product } from '@/types';

interface Product3DCardProps {
  product: Product;
}

export function Product3DCard({ product }: Product3DCardProps) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const discount = getDiscount(product.price);
  const rating = getRating(product);
  const reviewCount = getReviewCount(product);
  const inStock = product.stock_quantity > 0;

  const cartItem = {
    product,
    quantity: 1,
    selectedSize: product.sizes[0] || 'Free Size',
    selectedColor: product.colors[0] || 'Assorted',
  };

  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!inStock) {
      toast.error('Product is currently out of stock');
      return;
    }

    addToCart(cartItem);
    toast.success('Added to cart');
  };

  const handleBuyNow = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!inStock) {
      toast.error('Product is currently out of stock');
      return;
    }

    addToCart(cartItem);
    navigate('/checkout');
  };

  const handleWishlist = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(product);
    toast.success(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
  };

  return (
    <Link to={`/products/${product.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
        <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            <span className="rounded-sm bg-red-600 px-2 py-1 text-[11px] font-bold text-white">
              {discount}% OFF
            </span>
            {isBulkProduct(product) && (
              <span className="rounded-sm bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white">
                BULK BUY
              </span>
            )}
          </div>
          <button
            type="button"
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={handleWishlist}
            className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-slate-700 shadow-sm transition hover:text-red-600"
          >
            <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-600 text-red-600' : ''}`} />
          </button>
          {!inStock && (
            <div className="absolute inset-x-0 bottom-0 bg-slate-950/85 px-3 py-2 text-center text-xs font-bold text-white">
              OUT OF STOCK
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-3">
          <div className="mb-2 flex items-center gap-1 text-xs">
            <span className="inline-flex items-center gap-1 rounded-sm bg-emerald-600 px-1.5 py-0.5 font-bold text-white">
              {rating}
              <Star className="h-3 w-3 fill-current" />
            </span>
            <span className="text-slate-500">({reviewCount})</span>
            {isGstProduct(product) && (
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                <BadgeCheck className="h-3.5 w-3.5" />
                GST
              </span>
            )}
          </div>

          <h3 className="line-clamp-2 min-h-[40px] text-sm font-semibold leading-5 text-slate-900">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-slate-500">
            {product.description || 'Quality hosiery and fashion essentials'}
          </p>

          <div className="mt-3 flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-black text-slate-950">{rupee(product.price)}</span>
            <span className="text-xs text-slate-400 line-through">{rupee(getMrp(product.price))}</span>
            <span className="text-xs font-bold text-emerald-700">{discount}% off</span>
          </div>

          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-700">
            <Truck className="h-3.5 w-3.5" />
            Free delivery by 2-4 days
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-md border-slate-300 text-xs font-bold"
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
              Cart
            </Button>
            <Button
              type="button"
              className="h-9 rounded-md bg-red-600 text-xs font-bold text-white hover:bg-red-700"
              onClick={handleBuyNow}
              disabled={!inStock}
            >
              Buy Now
            </Button>
          </div>
        </div>
      </article>
    </Link>
  );
}
