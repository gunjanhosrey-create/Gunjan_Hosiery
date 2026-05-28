import { Navigate, Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BadgeIndianRupee,
  BarChart3,
  Boxes,
  Building2,
  CheckCircle2,
  Clock3,
  Download,
  Loader2,
  LogOut,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const dashboardStats = [
  {
    label: 'Monthly Orders',
    value: '128',
    change: '+18.4%',
    icon: ShoppingBag,
    tone: 'text-emerald-700',
  },
  {
    label: 'Wholesale Revenue',
    value: 'Rs. 8.42L',
    change: '+24.1%',
    icon: BadgeIndianRupee,
    tone: 'text-[#9a7528]',
  },
  {
    label: 'Active SKUs',
    value: '640',
    change: '52 low stock',
    icon: Boxes,
    tone: 'text-slate-700',
  },
  {
    label: 'Dispatch SLA',
    value: '96%',
    change: 'On-time',
    icon: Truck,
    tone: 'text-sky-700',
  },
];

const recentOrders = [
  { id: 'B2B-10482', date: 'Today', items: 'Winter basics x 420', amount: 'Rs. 1,84,500', status: 'Processing' },
  { id: 'B2B-10476', date: 'Yesterday', items: 'Kids premium sets x 260', amount: 'Rs. 96,800', status: 'Packed' },
  { id: 'B2B-10463', date: 'May 24', items: 'Men thermals x 310', amount: 'Rs. 1,22,400', status: 'Shipped' },
  { id: 'B2B-10458', date: 'May 22', items: 'Girls lounge edit x 180', amount: 'Rs. 74,250', status: 'Delivered' },
];

const inventoryAlerts = [
  'Black men thermal set: 18 units left',
  'Girls premium leggings: reorder recommended',
  'Kids value packs: demand up 31% this week',
];

function readMeta(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : '';
}

export default function B2BDashboardPage() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#fbf8f1]">
        <Loader2 className="h-8 w-8 animate-spin text-[#b7923c]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: '/b2b-dashboard' }} replace />;
  }

  const name =
    readMeta(profile?.name) ||
    readMeta(user.user_metadata?.full_name) ||
    readMeta(user.user_metadata?.name) ||
    'Distributor';
  const businessName = readMeta(user.user_metadata?.business_name) || 'Gunjan B2B Partner';
  const gstNumber = readMeta(user.user_metadata?.gst_number);
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'GH';

  return (
    <div className="min-h-screen bg-[#fbf8f1]">
      <section className="border-b border-[#e8dfd1] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-lg font-semibold text-[#f0d58a]">
              {initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-normal text-[#111]">
                  Business Dashboard
                </h1>
                <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                  Verified
                </Badge>
              </div>
              <p className="mt-1 text-sm text-[#6c6257]">
                {businessName} · {user.email}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/products">
              <Button variant="outline" className="rounded-xl border-[#d8ccb8] bg-white">
                Browse Catalog
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button className="rounded-xl bg-black text-white hover:bg-[#2b2b2b]" onClick={() => void signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] bg-[#111] p-6 text-white shadow-[0_28px_80px_-50px_rgba(0,0,0,0.75)] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-center">
            <div>
              <Badge className="rounded-full bg-[#c6a85a] text-black hover:bg-[#c6a85a]">
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                Distributor workspace
              </Badge>
              <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-normal sm:text-4xl">
                Welcome back, {name}. Your wholesale business is ready to move.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                Track bulk orders, manage dispatches, review inventory signals, download GST invoices,
                and reorder fast-moving fashion essentials from one clean panel.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button className="rounded-xl bg-[#c6a85a] text-black hover:bg-[#efd58f]">
                  Create Bulk Order
                </Button>
                <Button variant="outline" className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10">
                  <Download className="mr-2 h-4 w-4" />
                  Download Price List
                </Button>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-[#f0d58a]" />
                <p className="text-sm font-medium text-white">Business Verification</p>
              </div>
              <div className="mt-5 space-y-4 text-sm text-white/70">
                <div className="flex items-center justify-between gap-4">
                  <span>GSTIN</span>
                  <span className="font-medium text-white">{gstNumber || 'Verified via profile'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Account Type</span>
                  <span className="font-medium text-white">Distributor</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Minimum Order</span>
                  <span className="font-medium text-white">100 units</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="rounded-3xl border-[#e8dfd1] bg-white shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5efe4] ${stat.tone}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-emerald-700">{stat.change}</span>
                  </div>
                  <p className="mt-5 text-3xl font-semibold text-[#111]">{stat.value}</p>
                  <p className="mt-1 text-sm text-[#6c6257]">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="rounded-3xl border-[#e8dfd1] bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle className="text-xl text-[#111]">Recent B2B Orders</CardTitle>
              <Button variant="outline" size="sm" className="rounded-xl border-[#d8ccb8]">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-[#eee6da] text-xs uppercase tracking-[0.18em] text-[#8a8176]">
                    <tr>
                      <th className="py-3 font-medium">Order</th>
                      <th className="py-3 font-medium">Date</th>
                      <th className="py-3 font-medium">Items</th>
                      <th className="py-3 font-medium">Amount</th>
                      <th className="py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0e8dc]">
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="py-4 font-medium text-[#111]">{order.id}</td>
                        <td className="py-4 text-[#6c6257]">{order.date}</td>
                        <td className="py-4 text-[#6c6257]">{order.items}</td>
                        <td className="py-4 font-medium text-[#111]">{order.amount}</td>
                        <td className="py-4">
                          <span className="rounded-full bg-[#f5efe4] px-3 py-1 text-xs font-medium text-[#8a6a20]">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-3xl border-[#e8dfd1] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-[#111]">
                  <Clock3 className="h-5 w-5 text-[#a27d2d]" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {[
                  { icon: PackageCheck, label: 'Reorder best sellers' },
                  { icon: BarChart3, label: 'View sales report' },
                  { icon: Users, label: 'Contact account manager' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      className="flex items-center justify-between rounded-2xl border border-[#eee6da] bg-[#fffdf8] px-4 py-3 text-left text-sm font-medium text-[#111] transition hover:border-[#c6a85a] hover:bg-[#fbf4e6]"
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-[#a27d2d]" />
                        {item.label}
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-[#8a8176]" />
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-[#e8dfd1] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-[#111]">Inventory Signals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {inventoryAlerts.map((alert) => (
                  <div key={alert} className="rounded-2xl bg-[#fbf8f1] px-4 py-3 text-sm text-[#5f574e]">
                    {alert}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
