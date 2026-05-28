import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Boxes,
  Heart,
  Menu,
  Search,
  ShieldCheck,
  ShoppingCart,
  Store,
  User,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { marketplaceCategories, searchSuggestions } from '@/lib/marketplace';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

const quickLinks = [
  { label: 'Today Deals', href: '/products?sale=true', tone: 'text-red-600' },
  { label: 'Bulk Order', href: '/products?category=value-pack', tone: 'text-emerald-700' },
  { label: 'GST Signup', href: '/login', tone: 'text-amber-700' },
  { label: 'Track Order', href: '/whatsapp-order', tone: 'text-slate-700' },
];

const megaMenuHighlights = [
  { title: 'Bulk order essentials', description: 'Ready stock for distributors', href: '/products?category=value-pack' },
  { title: 'GST-ready deals', description: 'Invoice-ready seller catalog', href: '/login' },
  { title: 'Trending categories', description: 'Fast-moving fashion favorites', href: '/products?filter=trending' },
  { title: 'New arrivals', description: 'Fresh launch collections', href: '/products?filter=new' },
];

export function Navbar() {
  const { user } = useAuth();
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(marketplaceCategories[0]?.slug || '');
  const [notificationCount] = useState(3);

  const activeCategoryItem = useMemo(
    () => marketplaceCategories.find((category) => category.slug === activeCategory) ?? marketplaceCategories[0],
    [activeCategory]
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get('q') || '');
  }, [location.search]);

  const submitSearch = (value = query) => {
    const trimmed = value.trim();
    navigate(trimmed ? `/products?q=${encodeURIComponent(trimmed)}` : '/products');
    setSuggestionsOpen(false);
  };

  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="bg-[#111827] text-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-3 py-2 text-xs sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <ShieldCheck className="h-4 w-4 flex-shrink-0 text-emerald-400" />
            <span className="truncate">GST invoice, secure payment, fast B2B dispatch</span>
          </div>
          <div className="hidden items-center gap-4 font-medium md:flex">
            <Link to="/contact" className="hover:text-amber-300">Support</Link>
            <Link to="/b2b-dashboard" className="hover:text-amber-300">Distributor Panel</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-3 sm:px-5">
        <div className="grid min-h-[70px] grid-cols-[auto_1fr_auto] items-center gap-3 py-3 lg:gap-5">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-md border-slate-200 lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] overflow-y-auto p-0">
                <div className="flex items-center justify-between border-b px-4 py-4">
                  <Link to="/" className="flex items-center gap-2">
                    <img src="/images/gunjan-logo.png" alt="Gunjan Hosiery" className="h-10 w-10 rounded-md object-cover" />
                    <span className="font-bold text-slate-950">Gunjan Hosiery</span>
                  </Link>
                </div>
                <div className="grid gap-2 p-4">
                  {marketplaceCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Link
                        key={category.slug}
                        to={category.href}
                        className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800"
                      >
                        <Icon className="h-5 w-5 text-red-600" />
                        {category.label}
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/" className="flex min-w-max items-center gap-2">
              <img src="/images/gunjan-logo.png" alt="Gunjan Hosiery" className="h-11 w-11 rounded-md object-cover ring-1 ring-slate-200" />
              <div className="leading-tight">
                <p className="text-base font-black text-slate-950 sm:text-xl">Gunjan Hosiery</p>
                <p className="hidden text-[11px] font-semibold uppercase text-red-600 sm:block">B2B/B2C Marketplace</p>
              </div>
            </Link>
          </div>

          <form
            className="relative"
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch();
            }}
            onFocus={() => setSuggestionsOpen(true)}
            onBlur={() => setTimeout(() => setSuggestionsOpen(false), 140)}
          >
            <div className="flex h-11 overflow-hidden rounded-md border border-slate-300 bg-slate-50 focus-within:border-red-500 focus-within:bg-white">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search for tees, kidswear, thermals, bulk packs..."
                className="h-full border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  className="px-2 text-slate-400 hover:text-slate-700"
                  onClick={() => setQuery('')}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button type="submit" aria-label="Search" className="flex w-12 items-center justify-center bg-red-600 text-white transition hover:bg-red-700">
                <Search className="h-5 w-5" />
              </button>
            </div>

            {suggestionsOpen && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl">
                <div className="border-b bg-slate-50 px-3 py-2 text-xs font-bold uppercase text-slate-500">
                  Popular searches
                </div>
                {searchSuggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      submitSearch(item);
                    }}
                    className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-red-50 hover:text-red-700"
                  >
                    <Search className="h-4 w-4 text-slate-400" />
                    {item}
                  </button>
                ))}
              </div>
            )}
          </form>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-md text-slate-700 hover:text-red-600">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                  {notificationCount}
                </span>
              )}
            </Button>
            <Link to={user ? '/account' : '/login'}>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-md">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/products?wishlist=true" className="relative hidden sm:block">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-md">
                <Heart className="h-5 w-5" />
              </Button>
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-amber-500 px-1 text-[11px] font-bold text-black">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative">
              <Button className="h-10 rounded-md bg-slate-950 px-3 text-white hover:bg-slate-800">
                <ShoppingCart className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Cart</span>
              </Button>
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 overflow-x-auto px-3 py-2 sm:px-5">
          {marketplaceCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.slug}
                to={category.href}
                onMouseEnter={() => {
                  setActiveCategory(category.slug);
                  setMegaOpen(true);
                }}
                className="flex min-w-max items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-red-50 hover:text-red-700"
              >
                <Icon className="h-4 w-4" />
                {category.label}
              </Link>
            );
          })}
          <div className="ml-auto hidden min-w-max items-center gap-2 lg:flex">
            <Link
              to="/products?sale=true"
              className="flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
            >
              <Zap className="h-3.5 w-3.5" /> Offers
            </Link>
            <Link
              to="/products?category=value-pack"
              className="flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
            >
              <Boxes className="h-3.5 w-3.5" /> Bulk Order
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
            >
              <Store className="h-3.5 w-3.5" /> GST Signup
            </Link>
          </div>
        </div>

        <div
          className={`absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-b-3xl border border-slate-200 bg-white shadow-xl transition-all duration-300 ${megaOpen ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 -translate-y-4'}`}
          onMouseLeave={() => setMegaOpen(false)}
        >
          <div className="mx-auto grid max-w-[1440px] gap-6 px-3 py-5 sm:px-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="hidden rounded-3xl border border-slate-200 bg-slate-50 p-5 lg:block">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Explore categories</p>
              <div className="mt-4 grid gap-3">
                {marketplaceCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Link
                      key={category.slug}
                      to={category.href}
                      onMouseEnter={() => setActiveCategory(category.slug)}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:bg-red-50"
                    >
                      <Icon className="h-4 w-4 text-red-600" />
                      {category.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500">Featured flow</p>
                <h3 className="mt-4 text-xl font-black text-slate-950">{activeCategoryItem.label} trends</h3>
                <p className="mt-3 text-sm text-slate-600">Quick access to top selling categories, offers, and GST-ready bulk deals.</p>
                <div className="mt-6 grid gap-3">
                  {megaMenuHighlights.map((item) => (
                    <Link
                      key={item.title}
                      to={item.href}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-red-200 hover:bg-red-50"
                    >
                      <p>{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="grid gap-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-600">Distributor perks</p>
                  <p className="mt-4 text-2xl font-black text-slate-950">GST invoice, priority dispatch, bulk prices</p>
                  <p className="mt-3 text-sm text-slate-600">Enter your GST details to unlock special pricing and verified seller benefits.</p>
                  <Link to="/login" className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-500">
                    GST Signup
                  </Link>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-600">Fast offers</p>
                  <div className="mt-4 grid gap-3">
                    <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">Daily deals up to 70% off</div>
                    <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">Bulk savings on wholesale packs</div>
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">Verified seller selection for business buyers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
