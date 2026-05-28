import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, CreditCard, MessageCircle, ShieldCheck, Smartphone, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { createOrder } from '@/db/api';
import { rupee } from '@/lib/marketplace';
import { useCart } from '@/contexts/CartContext';
import type { OrderItem } from '@/types';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const loadRazorpayScript = () =>
  new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi' | 'cod' | 'whatsapp'>('razorpay');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gstNumber: '',
    address: '',
    upiId: '',
  });

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const orderItems: OrderItem[] = cart.map((item) => ({
    product_id: item.product.id,
    product_name: item.product.name,
    product_image: item.product.image_url,
    quantity: item.quantity,
    size: item.selectedSize,
    color: item.selectedColor,
    price: item.product.price,
  }));

  const saveOrder = async (paymentStatus: string, transactionId: string | null) =>
    createOrder({
      customer_name: formData.name,
      customer_email: formData.email || null,
      customer_phone: formData.phone,
      customer_address: `${formData.address}${formData.gstNumber ? `\nGSTIN: ${formData.gstNumber}` : ''}`,
      payment_method: paymentMethod.toUpperCase(),
      payment_status: paymentStatus,
      transaction_id: transactionId,
      total_amount: getCartTotal(),
      order_items: orderItems,
    });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      toast.error('Please fill delivery name, phone, and address');
      return;
    }

    if (paymentMethod === 'upi' && !formData.upiId.trim()) {
      toast.error('Please enter your UPI ID');
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === 'razorpay') {
        const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
        if (!key) {
          toast.error('Razorpay key missing. Add VITE_RAZORPAY_KEY_ID in .env.');
          setLoading(false);
          return;
        }

        const loaded = await loadRazorpayScript();
        if (!loaded || !window.Razorpay) {
          toast.error('Unable to load secure payment checkout.');
          setLoading(false);
          return;
        }

        const razorpay = new window.Razorpay({
          key,
          amount: Math.round(getCartTotal() * 100),
          currency: 'INR',
          name: 'Gunjan Hosiery',
          description: 'Fashion marketplace order',
          image: '/images/gunjan-logo.png',
          prefill: { name: formData.name, email: formData.email, contact: formData.phone },
          theme: { color: '#dc2626' },
          handler: async (response: { razorpay_payment_id?: string }) => {
            try {
              await saveOrder('paid', response.razorpay_payment_id ?? `RZP${Date.now()}`);
              clearCart();
              toast.success('Payment complete. Order placed.');
              navigate('/');
            } catch (error) {
              console.error('Paid order save failed:', error);
              toast.error('Payment done, but order save failed. Contact support.');
            } finally {
              setLoading(false);
            }
          },
          modal: { ondismiss: () => setLoading(false) },
        });
        razorpay.open();
        return;
      }

      const order = await saveOrder(paymentMethod === 'cod' || paymentMethod === 'whatsapp' ? 'pending' : 'paid', paymentMethod === 'cod' ? null : `TXN${Date.now()}`);
      clearCart();

      if (paymentMethod === 'upi') {
        toast.success('Order placed. Complete UPI payment.');
        window.location.href = `upi://pay?pa=${encodeURIComponent(formData.upiId)}&pn=Gunjan%20Hosiery&am=${getCartTotal()}&cu=INR&tn=Order%20${order.id.slice(0, 8)}`;
        setTimeout(() => navigate('/'), 1500);
        return;
      }

      if (paymentMethod === 'whatsapp') {
        const message = `New Gunjan Hosiery Order #${order.id.slice(0, 8)}\nCustomer: ${formData.name}\nPhone: ${formData.phone}\nTotal: ${rupee(getCartTotal())}`;
        window.open(`https://wa.me/919170259644?text=${encodeURIComponent(message)}`, '_blank');
      }

      toast.success(paymentMethod === 'cod' ? 'Order placed with Cash on Delivery.' : 'Order placed successfully.');
      navigate('/');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <div className="mx-auto max-w-[1240px] px-3 py-5 sm:px-5">
        <div className="mb-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <h1 className="text-2xl font-black text-slate-950">Checkout</h1>
          <p className="mt-1 text-sm text-slate-600">Secure payment, COD options, and GST invoice support.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-4">
            <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">Delivery Information</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className="mt-1 rounded-md" required />
                </div>
                <div>
                  <Label htmlFor="phone">Mobile Number *</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} className="mt-1 rounded-md" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className="mt-1 rounded-md" />
                </div>
                <div>
                  <Label htmlFor="gst">GST Number for Invoice</Label>
                  <Input id="gst" value={formData.gstNumber} onChange={(event) => setFormData({ ...formData, gstNumber: event.target.value.toUpperCase() })} placeholder="Optional for B2B" className="mt-1 rounded-md uppercase" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address">Complete Address *</Label>
                  <Textarea id="address" value={formData.address} onChange={(event) => setFormData({ ...formData, address: event.target.value })} rows={4} className="mt-1 rounded-md" required />
                </div>
              </div>
            </section>

            <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">Payment Method</h2>
              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as typeof paymentMethod)} className="mt-4 grid gap-3">
                {[
                  { value: 'razorpay', title: 'Secure Card / UPI', desc: 'Razorpay checkout', icon: CreditCard },
                  { value: 'upi', title: 'UPI Payment', desc: 'Google Pay, PhonePe, Paytm', icon: Smartphone },
                  { value: 'cod', title: 'Cash on Delivery', desc: 'Pay when order arrives', icon: Truck },
                  { value: 'whatsapp', title: 'WhatsApp Order', desc: 'Confirm with support team', icon: MessageCircle },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <label key={item.value} htmlFor={item.value} className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 p-3 transition hover:border-red-200 hover:bg-red-50">
                      <RadioGroupItem value={item.value} id={item.value} />
                      <span className="grid h-10 w-10 place-items-center rounded-md bg-slate-100 text-red-600">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block font-black text-slate-950">{item.title}</span>
                        <span className="text-sm text-slate-600">{item.desc}</span>
                      </span>
                    </label>
                  );
                })}
              </RadioGroup>

              {paymentMethod === 'upi' && (
                <div className="mt-4">
                  <Label htmlFor="upiId">UPI ID *</Label>
                  <Input id="upiId" value={formData.upiId} onChange={(event) => setFormData({ ...formData, upiId: event.target.value })} placeholder="yourname@upi" className="mt-1 rounded-md" required />
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-3 lg:sticky lg:top-[154px] lg:self-start">
            <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">Order Summary</h2>
              <div className="mt-4 space-y-3">
                {cart.map((item) => (
                  <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-3">
                    <img src={item.product.image_url} alt={item.product.name} className="h-16 w-14 rounded-md object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-black text-slate-950">{item.product.name}</p>
                      <p className="text-xs text-slate-500">{item.selectedSize} | {item.selectedColor} | Qty {item.quantity}</p>
                      <p className="text-sm font-black text-slate-950">{rupee(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="font-bold">{rupee(getCartTotal())}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Delivery</span><span className="font-bold text-emerald-700">Free</span></div>
                <div className="flex justify-between text-lg font-black"><span>Total</span><span>{rupee(getCartTotal())}</span></div>
              </div>
              <Button type="submit" className="mt-4 h-12 w-full rounded-md bg-red-600 text-base font-black hover:bg-red-700" disabled={loading}>
                {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place COD Order' : 'Place Order Securely'}
              </Button>
            </section>

            <section className="grid gap-2 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              {[
                { label: 'SSL secure payment', icon: ShieldCheck },
                { label: 'COD available', icon: Truck },
                { label: 'GST invoice support', icon: BadgeCheck },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Icon className="h-4 w-4 text-red-600" />
                    {item.label}
                  </div>
                );
              })}
            </section>
          </aside>
        </form>
      </div>
    </div>
  );
}
