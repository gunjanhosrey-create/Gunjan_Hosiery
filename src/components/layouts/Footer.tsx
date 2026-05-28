import { Facebook, Instagram, Mail, MapPin, Phone, ShieldCheck, Truck, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

const columns = [
  {
    title: 'Shop',
    links: [
      { label: 'Men', href: '/products?category=men' },
      { label: 'Women', href: '/products?category=women' },
      { label: 'Kids', href: '/products?category=kids' },
      { label: 'Today Deals', href: '/products?sale=true' },
      { label: 'Bulk Buy', href: '/products?category=value-pack' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'Track Order', href: '/whatsapp-order' },
      { label: 'Shipping Policy', href: '/contact' },
      { label: 'Returns', href: '/contact' },
      { label: 'Privacy Policy', href: '/contact' },
    ],
  },
  {
    title: 'Business',
    links: [
      { label: 'Distributor Signup', href: '/login' },
      { label: 'GST Invoice', href: '/login' },
      { label: 'Wholesale Pricing', href: '/products?category=value-pack' },
      { label: 'B2B Dashboard', href: '/b2b-dashboard' },
    ],
  },
];

const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/gunjanhosiery?igsh=ODh6M2hzc3N6dDV2', icon: Instagram },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61576791716033', icon: Facebook },
  { label: 'YouTube', href: 'https://www.youtube.com/', icon: Youtube },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <div className="flex items-center gap-3">
              <img src="/images/gunjan-logo.png" alt="Gunjan Hosiery logo" className="h-12 w-12 rounded-md object-cover ring-1 ring-white/10" />
              <div>
                <p className="text-xl font-black text-white">Gunjan Hosiery</p>
                <p className="text-xs font-bold uppercase text-red-400">Fashion marketplace</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <p className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />C-34, UPSIDC Industrial Area, Rooma, Kanpur, Uttar Pradesh 209402</p>
              <a href="mailto:gunjanhosrey@gmail.com" className="flex gap-3 hover:text-white"><Mail className="h-4 w-4 text-red-400" />gunjanhosrey@gmail.com</a>
              <a href="tel:+919170259644" className="flex gap-3 hover:text-white"><Phone className="h-4 w-4 text-red-400" />+91 9170259644</a>
            </div>
            <div className="mt-5 flex gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a key={item.label} href={item.href} target="_blank" rel="noreferrer" aria-label={item.label} className="grid h-9 w-9 place-items-center rounded-md bg-white/10 text-slate-200 transition hover:bg-red-600 hover:text-white">
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="text-sm font-black uppercase text-white">{column.title}</p>
                <div className="mt-4 grid gap-2">
                  {column.links.map((item) => (
                    <Link key={item.label} to={item.href} className="text-sm text-slate-400 transition hover:text-white">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-3 border-y border-white/10 py-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Secure payment', icon: ShieldCheck },
            { label: 'Fast dispatch', icon: Truck },
            { label: 'Verified seller', icon: ShieldCheck },
            { label: 'Business support', icon: Phone },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-2 text-sm font-bold text-slate-300">
                <Icon className="h-4 w-4 text-red-400" />
                {item.label}
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright (c) 2026 Gunjan Hosiery. All rights reserved.</p>
          <Link to="/admin" className="w-fit text-[10px] uppercase tracking-[0.24em] text-slate-500 transition hover:text-amber-400">
            Admin access
          </Link>
        </div>
      </div>
    </footer>
  );
}
