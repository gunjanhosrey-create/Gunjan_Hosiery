import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Product3DCard } from '@/components/Product3DCard';
import { getCategories, getProducts, getProductsByCategory, searchProducts } from '@/db/api';
import { getDiscount, isBulkProduct, isGstProduct, marketplaceCategories } from '@/lib/marketplace';
import { useWishlist } from '@/contexts/WishlistContext';
import type { Category, Product } from '@/types';

const priceRanges = [
  { label: 'Under Rs. 300', value: 'under-300' },
  { label: 'Rs. 300 - 599', value: '300-599' },
  { label: 'Rs. 600 - 999', value: '600-999' },
  { label: 'Rs. 1000+', value: '1000-plus' },
];

const brands = ['Gunjan Hosiery', 'Factory Direct', 'Value Pack', 'Premium Basics'];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { wishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState('all');
  const [size, setSize] = useState('all');
  const [color, setColor] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [gstOnly, setGstOnly] = useState(false);
  const [bulkOnly, setBulkOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);

  const categoryFilter = searchParams.get('category');
  const filterType = searchParams.get('filter');
  const saleView = searchParams.get('sale') === 'true';
  const wishlistView = searchParams.get('wishlist') === 'true';
  const queryParam = searchParams.get('q') || '';

  useEffect(() => {
    setQuery(queryParam);
  }, [queryParam]);

  useEffect(() => {
    getCategories().then(setCategories).catch((error) => console.error('Error loading categories:', error));
  }, []);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        let data: Product[] = [];
        const trimmedQuery = queryParam.trim();

        if (wishlistView) {
          data = wishlist;
        } else if (trimmedQuery) {
          data = await searchProducts(trimmedQuery);
        } else if (categoryFilter === 'value-pack') {
          data = (await getProducts()).filter((item) => isBulkProduct(item));
        } else if (categoryFilter) {
          const category = categories.find((item) => item.slug === categoryFilter);
          data = category
            ? await getProductsByCategory(category.id)
            : (await getProducts()).filter((item) =>
                `${item.name} ${item.description ?? ''} ${item.slug}`.toLowerCase().includes(categoryFilter.toLowerCase())
              );
        } else {
          data = await getProducts();
        }

        if (saleView) data = data.filter((item) => item.is_featured || item.is_trending || getDiscount(item.price) >= 35);
        if (filterType === 'featured') data = data.filter((item) => item.is_featured);
        if (filterType === 'new') data = data.filter((item) => item.is_new_arrival);
        if (filterType === 'trending') data = data.filter((item) => item.is_trending);

        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    if (categories.length || !categoryFilter || wishlistView) {
      loadProducts();
    }
  }, [categories, categoryFilter, filterType, queryParam, saleView, wishlist, wishlistView]);

  const availableSizes = useMemo(() => [...new Set(products.flatMap((item) => item.sizes || []).filter(Boolean))], [products]);
  const availableColors = useMemo(() => [...new Set(products.flatMap((item) => item.colors || []).filter(Boolean))], [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const searchable = `${product.name} ${product.description ?? ''} ${product.slug} ${product.colors.join(' ')} ${product.sizes.join(' ')}`.toLowerCase();
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      const matchesPrice =
        priceRange === 'all' ||
        (priceRange === 'under-300' && product.price < 300) ||
        (priceRange === '300-599' && product.price >= 300 && product.price <= 599) ||
        (priceRange === '600-999' && product.price >= 600 && product.price <= 999) ||
        (priceRange === '1000-plus' && product.price >= 1000);
      const matchesSize = size === 'all' || product.sizes.includes(size);
      const matchesColor = color === 'all' || product.colors.some((item) => item.toLowerCase() === color.toLowerCase());
      const matchesStock = !inStockOnly || product.stock_quantity > 0;
      const matchesGst = !gstOnly || isGstProduct(product);
      const matchesBulk = !bulkOnly || Boolean(isBulkProduct(product));
      const matchesDiscount = !discountOnly || getDiscount(product.price) >= 40;

      return matchesQuery && matchesPrice && matchesSize && matchesColor && matchesStock && matchesGst && matchesBulk && matchesDiscount;
    });
  }, [bulkOnly, color, discountOnly, gstOnly, inStockOnly, priceRange, products, query, size]);

  const sortedProducts = useMemo(() => {
    const cloned = [...filteredProducts];
    if (sortBy === 'price-low') return cloned.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') return cloned.sort((a, b) => b.price - a.price);
    if (sortBy === 'discount') return cloned.sort((a, b) => getDiscount(b.price) - getDiscount(a.price));
    if (sortBy === 'new') return cloned.sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
    return cloned.sort((a, b) => Number(b.is_trending) - Number(a.is_trending) || Number(b.is_featured) - Number(a.is_featured));
  }, [filteredProducts, sortBy]);

  const applyQuery = (value: string) => {
    setQuery(value);
    const params = new URLSearchParams(searchParams);
    value.trim() ? params.set('q', value.trim()) : params.delete('q');
    setSearchParams(params, { replace: true });
  };

  const clearFilters = () => {
    setPriceRange('all');
    setSize('all');
    setColor('all');
    setInStockOnly(false);
    setGstOnly(false);
    setBulkOnly(false);
    setDiscountOnly(false);
  };

  const filterPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-950">Filters</h2>
        <Button variant="ghost" size="sm" className="h-8 text-red-600" onClick={clearFilters}>
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      </div>

      <div>
        <p className="mb-3 text-sm font-black text-slate-950">Category</p>
        <div className="grid gap-2">
          {marketplaceCategories.slice(0, 7).map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                if (category.slug === 'deals') {
                  params.delete('category');
                  params.set('sale', 'true');
                } else {
                  params.delete('sale');
                  params.set('category', category.slug === 'bulk' ? 'value-pack' : category.slug);
                }
                setSearchParams(params);
              }}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50"
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-black text-slate-950">Price</p>
        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger className="rounded-md"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All prices</SelectItem>
            {priceRanges.map((range) => <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <p className="mb-3 text-sm font-black text-slate-950">Size</p>
        <div className="flex flex-wrap gap-2">
          {['all', ...availableSizes].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSize(item)}
              className={`min-w-10 rounded-md border px-3 py-2 text-xs font-bold uppercase ${
                size === item ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-black text-slate-950">Color</p>
        <Select value={color} onValueChange={setColor}>
          <SelectTrigger className="rounded-md"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All colors</SelectItem>
            {availableColors.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <p className="mb-3 text-sm font-black text-slate-950">Brand</p>
        <div className="grid gap-2">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center gap-2 text-sm text-slate-700">
              <Checkbox disabled />
              {brand}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {[
          { label: 'In stock only', checked: inStockOnly, onChange: setInStockOnly },
          { label: 'GST/business only', checked: gstOnly, onChange: setGstOnly },
          { label: 'Bulk discount available', checked: bulkOnly, onChange: setBulkOnly },
          { label: '40% or more discount', checked: discountOnly, onChange: setDiscountOnly },
        ].map((item) => (
          <label key={item.label} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
            <Checkbox checked={item.checked} onCheckedChange={(checked) => item.onChange(Boolean(checked))} />
            {item.label}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <div className="mx-auto max-w-[1440px] px-3 py-5 sm:px-5">
        <div className="mb-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
            <div>
              <h1 className="text-2xl font-black text-slate-950">
                {wishlistView ? 'Wishlist' : saleView ? "Today's Deals" : 'Gunjan Hosiery Catalog'}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {sortedProducts.length} products with discounts, ratings, GST invoice options, and fast delivery.
              </p>
            </div>
            <div className="relative">
              <Input
                value={query}
                onChange={(event) => applyQuery(event.target.value)}
                placeholder="Search within results"
                className="h-11 rounded-md border-slate-300 bg-slate-50 lg:w-[320px]"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-11 rounded-md border-slate-300 bg-white lg:w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Sort: Relevance</SelectItem>
                <SelectItem value="new">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="discount">Highest Discount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden rounded-md border border-slate-200 bg-white p-4 shadow-sm lg:block lg:self-start lg:sticky lg:top-[154px]">
            {filterPanel}
          </aside>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3 lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="rounded-md bg-white">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="overflow-y-auto">
                  {filterPanel}
                </SheetContent>
              </Sheet>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                <SlidersHorizontal className="h-4 w-4" />
                {sortedProducts.length} items
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 12 }).map((_, index) => (
                  <Skeleton key={index} className="h-80 rounded-md" />
                ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {sortedProducts.map((product) => (
                  <Product3DCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <p className="text-lg font-black text-slate-950">No products found</p>
                <p className="mt-2 text-sm text-slate-600">Try removing filters or searching another category.</p>
                <Button className="mt-5 rounded-md bg-red-600 hover:bg-red-700" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
