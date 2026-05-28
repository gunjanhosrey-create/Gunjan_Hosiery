import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  BadgeCheck,
  ChevronLeft,
  Heart,
  MapPin,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Product3DCard } from '@/components/Product3DCard';
import { getProductBySlug, getProductsByCategory } from '@/db/api';
import { getDiscount, getMrp, getRating, getReviewCount, isBulkProduct, isGstProduct, rupee, trustBadges } from '@/lib/marketplace';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import type { Product } from '@/types';

const normalizeOptions = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
};

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await getProductBySlug(slug);
        const normalized = data
          ? {
              ...data,
              sizes: normalizeOptions(data.sizes).length ? normalizeOptions(data.sizes) : ['S', 'M', 'L', 'XL', 'XXL'],
              colors: normalizeOptions(data.colors),
              additional_images: normalizeOptions(data.additional_images),
            }
          : null;
        setProduct(normalized);
        setSelectedSize(normalized?.sizes[0] || '');
        setSelectedColor(normalized?.colors[0] || '');
      } catch (error) {
        console.error('Product load failed:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  useEffect(() => {
    if (!product?.category_id) return;
    getProductsByCategory(product.category_id)
      .then((items) => setRelated(items.filter((item) => item.id !== product.id).slice(0, 4)))
      .catch((error) => console.error('Related products failed:', error));
  }, [product?.category_id, product?.id]);

  const images = useMemo(() => {
    if (!product) return [];
    return [product.image_url, ...product.additional_images].filter(Boolean);
  }, [product]);

  if (loading) {
    return <div className="min-h-[60vh] bg-[#f5f6f8] p-8 text-center font-bold text-slate-600">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] bg-[#f5f6f8] p-8 text-center">
        <p className="text-xl font-black text-slate-950">Product not found</p>
        <Button className="mt-4 rounded-md bg-red-600" onClick={() => navigate('/products')}>Back to catalog</Button>
      </div>
    );
  }

  const rating = getRating(product);
  const reviewCount = getReviewCount(product);
  const discount = getDiscount(product.price);
  const wishlisted = isWishlisted(product.id);
  const inStock = product.stock_quantity > 0;

  const cartItem = {
    product,
    quantity,
    selectedSize: selectedSize || 'Free Size',
    selectedColor: selectedColor || 'Assorted',
  };

  const addItem = () => {
    if (!inStock) {
      toast.error('Product is out of stock');
      return;
    }
    addToCart(cartItem);
    toast.success('Added to cart');
  };

  const buyNow = () => {
    if (!inStock) {
      toast.error('Product is out of stock');
      return;
    }
    addToCart(cartItem);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <div className="mx-auto max-w-[1440px] px-3 py-5 sm:px-5">
        <button type="button" className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-red-600" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,620px)_minmax(0,1fr)]">
          <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
            <div className="grid gap-3 md:grid-cols-[76px_minmax(0,1fr)]">
              <div className="order-2 flex gap-2 overflow-x-auto md:order-1 md:flex-col">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setImageIndex(index)}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border ${
                      imageIndex === index ? 'border-red-600' : 'border-slate-200'
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="relative order-1 overflow-hidden rounded-md bg-slate-100 md:order-2">
                <img src={images[imageIndex] || product.image_url} alt={product.name} className="aspect-[4/5] w-full object-contain" />
                <button
                  type="button"
                  aria-label="Toggle wishlist"
                  onClick={() => {
                    toggleWishlist(product);
                    toast.success(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
                  }}
                  className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white text-slate-700 shadow-sm"
                >
                  <Heart className={`h-5 w-5 ${wishlisted ? 'fill-red-600 text-red-600' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-sm bg-red-600 px-2 py-1 text-xs font-black text-white">{discount}% OFF</span>
                {isBulkProduct(product) && <span className="rounded-sm bg-emerald-600 px-2 py-1 text-xs font-black text-white">BULK DEAL</span>}
                {isGstProduct(product) && <span className="rounded-sm bg-amber-400 px-2 py-1 text-xs font-black text-black">GST INVOICE</span>}
              </div>
              <h1 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl">{product.name}</h1>
              {product.description && <p className="mt-2 text-sm leading-6 text-slate-600">{product.description}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-sm bg-emerald-600 px-2 py-1 text-sm font-bold text-white">
                  {rating}
                  <Star className="h-3.5 w-3.5 fill-current" />
                </span>
                <span className="text-sm text-slate-500">{reviewCount} ratings</span>
                <span className="text-sm font-semibold text-emerald-700">Verified seller</span>
              </div>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <span className="text-3xl font-black text-slate-950">{rupee(product.price)}</span>
                <span className="text-base text-slate-400 line-through">{rupee(getMrp(product.price))}</span>
                <span className="text-base font-black text-emerald-700">{discount}% off</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-600">Inclusive of all taxes. GST invoice available for business accounts.</p>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-black text-slate-950">Select Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setSelectedSize(item)}
                        className={`min-w-12 rounded-md border px-3 py-2 text-sm font-black ${
                          selectedSize === item ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-black text-slate-950">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {(product.colors.length ? product.colors : ['Assorted']).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setSelectedColor(item)}
                        className={`rounded-md border px-3 py-2 text-sm font-black ${
                          selectedColor === item || (!selectedColor && item === 'Assorted')
                            ? 'border-red-600 bg-red-50 text-red-700'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-[150px_1fr]">
                <div>
                  <p className="mb-2 text-sm font-black text-slate-950">Quantity</p>
                  <div className="flex h-11 overflow-hidden rounded-md border border-slate-200">
                    <button type="button" className="w-11 font-black" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                    <span className="grid flex-1 place-items-center border-x border-slate-200 font-black">{quantity}</span>
                    <button type="button" className="w-11 font-black" onClick={() => setQuantity(Math.min(product.stock_quantity || 1, quantity + 1))}>+</button>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-black text-slate-950">Check Delivery</p>
                  <div className="flex h-11 overflow-hidden rounded-md border border-slate-200">
                    <Input
                      value={pincode}
                      onChange={(event) => setPincode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter pincode"
                      className="h-full border-0 shadow-none focus-visible:ring-0"
                    />
                    <button type="button" className="px-4 text-sm font-black text-red-600">Check</button>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <MapPin className="h-3.5 w-3.5" />
                    COD, fast dispatch, and bulk support available
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Button className="h-12 rounded-md bg-orange-500 text-base font-black text-white hover:bg-orange-600" onClick={addItem} disabled={!inStock}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button className="h-12 rounded-md bg-red-600 text-base font-black text-white hover:bg-red-700" onClick={buyNow} disabled={!inStock}>
                  <Zap className="mr-2 h-5 w-5" />
                  Buy Now
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Secure Payment', detail: 'UPI, card, COD', icon: ShieldCheck },
                { label: 'Easy Returns', detail: 'Support-assisted exchange', icon: PackageCheck },
                { label: 'Fast Delivery', detail: '2-4 day dispatch window', icon: Truck },
                { label: 'GST Invoice', detail: 'For verified distributors', icon: BadgeCheck },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm">
                    <Icon className="h-5 w-5 flex-shrink-0 text-red-600" />
                    <div>
                      <p className="text-sm font-black text-slate-950">{item.label}</p>
                      <p className="text-xs text-slate-600">{item.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Product Details</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {trustBadges.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-md bg-slate-50 p-4">
                  <Icon className="h-5 w-5 text-red-600" />
                  <p className="mt-3 font-black text-slate-950">{item.label}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                </div>
              );
            })}
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-950">Similar Products</h2>
              <Link to="/products" className="text-sm font-bold text-red-600 hover:underline">View more</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {related.map((item) => (
                <Product3DCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
