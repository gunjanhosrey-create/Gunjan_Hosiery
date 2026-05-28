import { useNavigate } from 'react-router-dom';
import { BadgeCheck, PackageCheck, ShieldCheck, ShoppingBag, Trash2, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { rupee } from '@/lib/marketplace';
import { useCart } from '@/contexts/CartContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();
  const subtotal = getCartTotal();
  const platformFee = cart.length ? 0 : 0;
  const savings = Math.round(subtotal * 0.18);

  if (cart.length === 0) {
    return (
      <div className="grid min-h-[65vh] place-items-center bg-[#f5f6f8] px-4 text-center">
        <div className="rounded-md border border-slate-200 bg-white p-8 shadow-sm">
          <ShoppingBag className="mx-auto h-16 w-16 text-slate-300" />
          <h1 className="mt-4 text-2xl font-black text-slate-950">Your cart is empty</h1>
          <p className="mt-2 text-sm text-slate-600">Add marketplace deals, combo packs, or B2B products to continue.</p>
          <Button className="mt-6 rounded-md bg-red-600 hover:bg-red-700" onClick={() => navigate('/products')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <div className="mx-auto max-w-[1240px] px-3 py-5 sm:px-5">
        <div className="mb-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <h1 className="text-2xl font-black text-slate-950">Shopping Cart</h1>
          <p className="mt-1 text-sm text-slate-600">{getCartCount()} items ready for secure checkout</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex gap-3">
                  <img src={item.product.image_url} alt={item.product.name} className="h-28 w-24 rounded-md bg-slate-100 object-cover sm:h-36 sm:w-28" />
                  <div className="min-w-0 flex-1">
                    <h2 className="line-clamp-2 text-sm font-black text-slate-950 sm:text-base">{item.product.name}</h2>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      Size: {item.selectedSize} | Color: {item.selectedColor}
                    </p>
                    <p className="mt-2 text-lg font-black text-slate-950">{rupee(item.product.price)}</p>
                    <p className="mt-1 text-xs font-semibold text-emerald-700">Free delivery | GST invoice eligible</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="flex h-9 overflow-hidden rounded-md border border-slate-200">
                        <button className="w-9 font-black" onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}>-</button>
                        <span className="grid w-10 place-items-center border-x border-slate-200 text-sm font-black">{item.quantity}</span>
                        <button className="w-9 font-black" onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}>+</button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 rounded-md text-red-600"
                        onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                      >
                        <Trash2 className="mr-1.5 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="space-y-3 lg:sticky lg:top-[154px] lg:self-start">
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">Price Details</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="font-bold">{rupee(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Delivery</span><span className="font-bold text-emerald-700">Free</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Platform fee</span><span className="font-bold">{rupee(platformFee)}</span></div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-black"><span>Total</span><span>{rupee(subtotal + platformFee)}</span></div>
                </div>
              </div>
              <div className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                You saved approx. {rupee(savings)} on this cart
              </div>
              <Button className="mt-4 h-12 w-full rounded-md bg-red-600 text-base font-black hover:bg-red-700" onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </Button>
              <Button variant="outline" className="mt-2 h-11 w-full rounded-md" onClick={() => navigate('/products')}>
                Continue Shopping
              </Button>
            </div>

            <div className="grid gap-2 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              {[
                { label: 'Secure payment', icon: ShieldCheck },
                { label: 'Fast dispatch', icon: Truck },
                { label: 'GST invoice', icon: BadgeCheck },
                { label: 'Easy support', icon: PackageCheck },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Icon className="h-4 w-4 text-red-600" />
                    {item.label}
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
