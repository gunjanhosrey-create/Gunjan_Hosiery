import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgePercent, Clock3, IndianRupee, ShieldCheck, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Product3DCard } from '@/components/Product3DCard';
import { getHomeBanner, getProducts } from '@/db/api';
import { isBulkProduct, marketplaceCategories, rupee, trustBadges } from '@/lib/marketplace';
import type { Product } from '@/types';

const fallbackHero =
  'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1600&q=80';

const supplierTiles = [
  'Factory direct pricing',
  'Kanpur hosiery specialist',
  'Bulk dispatch support',
  'GST-ready distributor orders',
];

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-xl font-black text-slate-950 sm:text-2xl">{title}</h2>
      {action && (
        <Link to={action} className="flex items-center gap-1 text-sm font-bold text-red-600 hover:underline">
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [banner, setBanner] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [productData, bannerData] = await Promise.all([getProducts(), getHomeBanner()]);
        setProducts(productData || []);
        setBanner(bannerData?.image_url || null);
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const featured = useMemo(
    () => (products.filter((item) => item.is_featured).length ? products.filter((item) => item.is_featured) : products).slice(0, 8),
    [products]
  );
  const trending = useMemo(
    () => (products.filter((item) => item.is_trending).length ? products.filter((item) => item.is_trending) : products).slice(0, 8),
    [products]
  );
  const arrivals = useMemo(
    () =>
      [...products]
        .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
        .slice(0, 8),
    [products]
  );
  const bulk = useMemo(
    () => (products.filter((item) => isBulkProduct(item)).length ? products.filter((item) => isBulkProduct(item)) : products).slice(0, 4),
    [products]
  );

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <section className="mx-auto max-w-[1440px] px-3 py-4 sm:px-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="relative min-h-[300px] overflow-hidden rounded-md bg-slate-950 text-white shadow-sm sm:min-h-[360px]">
            <img
              src={banner || fallbackHero}
              alt="Gunjan Hosiery marketplace offers"
              className="absolute inset-0 h-full w-full object-cover opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
            <div className="relative flex min-h-[300px] max-w-2xl flex-col justify-center p-5 sm:min-h-[360px] sm:p-9">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-sm bg-red-600 px-3 py-1 text-xs font-black">MEGA WHOLESALE SALE</span>
                <span className="rounded-sm bg-amber-400 px-3 py-1 text-xs font-black text-black">GST INVOICE</span>
              </div>
              <h1 className="text-3xl font-black leading-tight sm:text-5xl">
                Gunjan Hosiery fashion marketplace for retail and business buyers.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/85 sm:text-base">
                Shop hosiery, kidswear, innerwear, thermals, combo packs, and distributor bulk deals with familiar Indian commerce speed.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/products?sale=true">
                  <Button className="rounded-md bg-red-600 px-5 font-bold text-white hover:bg-red-700">
                    Shop Today Deals
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="rounded-md border-white/30 bg-white/10 px-5 font-bold text-white hover:bg-white hover:text-slate-950">
                    Become Distributor
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              { title: 'Bulk Order Benefits', value: 'Up to 50% margin', icon: Store, href: '/products?category=value-pack' },
              { title: 'Deal of the Day', value: 'Starts at Rs. 199', icon: Clock3, href: '/products?sale=true' },
              { title: 'Verified Purchase', value: 'GST + secure checkout', icon: ShieldCheck, href: '/login' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} to={item.href} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <Icon className="h-6 w-6 text-red-600" />
                  <p className="mt-4 text-sm font-bold text-slate-950">{item.title}</p>
                  <p className="mt-1 text-xl font-black text-slate-950">{item.value}</p>
                  <p className="mt-2 text-xs font-semibold text-emerald-700">Limited time offer</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-3 sm:px-5">
        <div className="grid grid-cols-4 gap-2 rounded-md border border-slate-200 bg-white p-2 shadow-sm sm:grid-cols-8">
          {marketplaceCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.slug} to={category.href} className="group flex flex-col items-center gap-2 rounded-md px-2 py-3 text-center transition hover:bg-red-50">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-800 transition group-hover:bg-red-600 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-bold text-slate-800">{category.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <main className="mx-auto max-w-[1440px] space-y-8 px-3 py-8 sm:px-5">
        <section className="rounded-md border border-red-100 bg-white p-4 shadow-sm">
          <SectionHeader title="Today's Deals" action="/products?sale=true" />
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
            <BadgePercent className="h-4 w-4" />
            Deal prices refresh soon. Add fast-moving products to cart now.
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-72 rounded-md" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
              {featured.slice(0, 6).map((product) => (
                <Product3DCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        <section>
          <SectionHeader title="Trending Now" action="/products?filter=trending" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-72 rounded-md" />)
              : trending.slice(0, 6).map((product) => <Product3DCard key={product.id} product={product} />)}
          </div>
        </section>

        <section className="rounded-md border border-emerald-100 bg-emerald-50 p-4">
          <SectionHeader title="Bulk Buy Offers" action="/products?category=value-pack" />
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            {[
              { label: 'Distributor MOQ', value: '100+ units' },
              { label: 'Wholesale Saving', value: 'Extra 8-18%' },
              { label: 'Invoice Ready', value: 'GST enabled' },
            ].map((item) => (
              <div key={item.label} className="rounded-md border border-emerald-200 bg-white p-3">
                <p className="text-xs font-bold uppercase text-emerald-700">{item.label}</p>
                <p className="mt-1 text-xl font-black text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-72 rounded-md" />)
              : bulk.map((product) => <Product3DCard key={product.id} product={product} />)}
          </div>
        </section>

        <section>
          <SectionHeader title="New Arrivals" action="/products?filter=new" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-72 rounded-md" />)
              : arrivals.slice(0, 6).map((product) => <Product3DCard key={product.id} product={product} />)}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <IndianRupee className="h-7 w-7 text-amber-600" />
              <div>
                <h2 className="text-xl font-black text-slate-950">Best Offers</h2>
                <p className="text-sm text-slate-600">Curated for repeat purchase and higher margin.</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                ['Starter combo', rupee(499)],
                ['Retailer pack', rupee(2499)],
                ['Kids collection', '40% off'],
                ['Winter thermal', 'Buy more save more'],
              ].map(([label, value]) => (
                <Link key={label} to="/products?sale=true" className="rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:border-red-200 hover:bg-red-50">
                  <p className="text-sm font-bold text-slate-950">{label}</p>
                  <p className="mt-1 text-lg font-black text-red-600">{value}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">Top Brands and Suppliers</h2>
            <p className="mt-1 text-sm text-slate-600">A trusted Gunjan Hosiery supply experience for Indian retailers.</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {supplierTiles.map((item) => (
                <div key={item} className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-800">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          {trustBadges.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-start gap-3 rounded-md bg-slate-50 p-4">
                <Icon className="h-6 w-6 flex-shrink-0 text-red-600" />
                <div>
                  <p className="font-black text-slate-950">{item.label}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
