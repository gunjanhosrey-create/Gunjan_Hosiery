import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Camera, CheckCircle2, Loader2, LogOut, Mail, Package, Phone, ShieldCheck, Store, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { getOrdersForCustomer } from '@/db/api';
import { supabase } from '@/db/supabase';
import type { Order } from '@/types';

const avatarStorageKey = (userId: string) => `profile-avatar:${userId}`;

const initialProfileForm = {
  name: '',
  email: '',
  phone: '',
  fullAddress: '',
  streetArea: '',
  village: '',
  city: '',
  state: '',
  pincode: '',
  gstNumber: '',
};

const readImageAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });

const readMetadataString = (value: unknown) =>
  typeof value === 'string' ? value : '';

export default function ProfilePage() {
  const { user, profile, loading, saveProfile, refreshProfile, signOut } = useAuth();
  const [form, setForm] = useState(initialProfileForm);
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [sendingEmailUpdate, setSendingEmailUpdate] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const savedAvatar = window.localStorage.getItem(avatarStorageKey(user.id));
    const fullAddress = profile?.address || '';

    setAvatar(savedAvatar || readMetadataString(user.user_metadata?.avatar_url));
    setForm({
      name: readMetadataString(profile?.name) || readMetadataString(user.user_metadata?.full_name) || readMetadataString(user.user_metadata?.name),
      email: user.email || '',
      phone: readMetadataString(profile?.phone) || readMetadataString(user.user_metadata?.phone),
      fullAddress: readMetadataString(fullAddress),
      streetArea: readMetadataString(user.user_metadata?.street_area),
      village: readMetadataString(user.user_metadata?.village),
      city: readMetadataString(profile?.city),
      state: readMetadataString(user.user_metadata?.state),
      pincode: readMetadataString(profile?.pincode),
      gstNumber: readMetadataString(user.user_metadata?.gst_number),
    });
  }, [user, profile]);

  useEffect(() => {
    if (!user) return;

    const loadOrders = async () => {
      setOrdersLoading(true);
      try {
        const data = await getOrdersForCustomer({
          email: user.email,
          phone: readMetadataString(profile?.phone) || readMetadataString(user.user_metadata?.phone) || null,
        });
        setOrders(data);
      } catch (error) {
        console.error(error);
        toast.error('Order history could not be loaded');
      } finally {
        setOrdersLoading(false);
      }
    };

    void loadOrders();
  }, [user, profile?.phone]);

  const accountType = user?.user_metadata?.account_type === 'dealer' ? 'Dealer Account' : 'Customer Account';
  const isDealer = user?.user_metadata?.account_type === 'dealer';
  const emailVerified = Boolean(user?.email_confirmed_at);
  const phoneVerified = false;

  const fallbackAvatar = useMemo(() => {
    const seed = form.name || user?.email || 'Customer';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(seed)}&background=fee2e2&color=b91c1c`;
  }, [form.name, user?.email]);

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const image = await readImageAsDataUrl(file);
      setAvatar(image);
      window.localStorage.setItem(avatarStorageKey(user.id), image);
      toast.success('Profile image updated on this device');
    } catch (error) {
      console.error(error);
      toast.error('Image could not be loaded');
    } finally {
      event.target.value = '';
    }
  };

  const handleSaveProfile = async (event: FormEvent) => {
    event.preventDefault();

    if (!user) return;

    setSaving(true);

    const { error: profileError } = await saveProfile({
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.fullAddress.trim(),
      city: form.city.trim(),
      pincode: form.pincode.trim(),
    });

    if (profileError) {
      toast.error(profileError.message);
      setSaving(false);
      return;
    }

    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        full_name: form.name.trim(),
        phone: form.phone.trim(),
        street_area: form.streetArea.trim(),
        village: form.village.trim(),
        state: form.state.trim(),
        gst_number: form.gstNumber.trim() || null,
      },
    });

    if (metadataError) {
      toast.error(metadataError.message);
      setSaving(false);
      return;
    }

    await refreshProfile();
    toast.success('Profile updated successfully');
    setSaving(false);
  };

  const handleEmailUpdate = async () => {
    if (!user) return;
    if (!form.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (form.email.trim() === user.email) {
      toast.message('Email is already up to date');
      return;
    }

    setSendingEmailUpdate(true);
    const { error } = await supabase.auth.updateUser({ email: form.email.trim() });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Email update link sent. Please confirm from your inbox.');
    }

    setSendingEmailUpdate(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <Card className="overflow-hidden border-slate-200 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)]">
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-red-900 p-8 text-white">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <div className="relative">
                  <img
                    src={avatar || fallbackAvatar}
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover ring-4 ring-white/20"
                  />
                  <label
                    htmlFor="profile-avatar"
                    className="absolute -bottom-2 -right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-slate-900 shadow-lg transition hover:scale-105"
                  >
                    <Camera className="h-4 w-4" />
                  </label>
                  <input
                    id="profile-avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-white/60">My Account</p>
                  <h1 className="mt-2 text-3xl font-black">{form.name || 'Your Profile'}</h1>
                  <p className="mt-2 text-sm text-white/75">Manage your details, delivery address, and account preferences from one place.</p>
                </div>
              </div>
            </div>
            <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Account Type</p>
                <p className="mt-2 flex items-center gap-2 text-base font-semibold text-slate-900">
                  <Store className="h-4 w-4 text-red-600" />
                  {accountType}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Profile Status</p>
                <p className="mt-2 flex items-center gap-2 text-base font-semibold text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  {profile ? 'Profile active' : 'Complete your details'}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="sm:col-span-2"
                onClick={() => void signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)]">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Verification</CardTitle>
              <CardDescription>Professional account screens usually show verification status clearly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Mail className="h-4 w-4 text-red-600" />
                      Email verification
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {emailVerified
                        ? 'Your current email is verified through your account sign-in flow.'
                        : 'Your email is not verified yet. Please check your inbox for the verification link.'}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${emailVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {emailVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Phone className="h-4 w-4 text-red-600" />
                      Mobile OTP verification
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Phone OTP UI is planned, but real OTP verification still needs Supabase phone auth setup for this project.
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${phoneVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                    {phoneVerified ? 'Verified' : 'Setup Required'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-900">Edit Profile</CardTitle>
            <CardDescription>Keep your contact details and delivery address updated for a smoother checkout experience.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSaveProfile}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">Full Name</Label>
                  <Input
                    id="profile-name"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-phone">Mobile Number</Label>
                  <Input
                    id="profile-phone"
                    value={form.phone}
                    onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                    placeholder="Enter your mobile number"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="space-y-2">
                  <Label htmlFor="profile-email">Email Address</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <Button type="button" variant="outline" onClick={() => void handleEmailUpdate()} disabled={sendingEmailUpdate}>
                  {sendingEmailUpdate ? 'Sending...' : 'Update Email'}
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-address">Full Address</Label>
                <Textarea
                  id="profile-address"
                  value={form.fullAddress}
                  onChange={(event) => setForm((prev) => ({ ...prev, fullAddress: event.target.value }))}
                  placeholder="House no, building name, landmark"
                  rows={4}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="profile-street">Street / Area</Label>
                  <Input
                    id="profile-street"
                    value={form.streetArea}
                    onChange={(event) => setForm((prev) => ({ ...prev, streetArea: event.target.value }))}
                    placeholder="Street or area"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-village">Village / Locality</Label>
                  <Input
                    id="profile-village"
                    value={form.village}
                    onChange={(event) => setForm((prev) => ({ ...prev, village: event.target.value }))}
                    placeholder="Village or locality"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="profile-city">City</Label>
                  <Input
                    id="profile-city"
                    value={form.city}
                    onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                    placeholder="Enter your city"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-state">State</Label>
                  <Input
                    id="profile-state"
                    value={form.state}
                    onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value }))}
                    placeholder="Enter your state"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-pincode">Pincode</Label>
                  <Input
                    id="profile-pincode"
                    value={form.pincode}
                    onChange={(event) => setForm((prev) => ({ ...prev, pincode: event.target.value }))}
                    placeholder="Enter pincode"
                    required
                  />
                </div>
              </div>

              {isDealer && (
                <div className="space-y-2">
                  <Label htmlFor="profile-gst">GST Number</Label>
                  <Input
                    id="profile-gst"
                    value={form.gstNumber}
                    onChange={(event) => setForm((prev) => ({ ...prev, gstNumber: event.target.value }))}
                    placeholder="Enter GST number"
                  />
                </div>
              )}

              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Save changes to keep checkout and profile details updated.
                </span>
              </div>

              <Button type="submit" className="w-full bg-slate-950 text-white hover:bg-slate-800" disabled={saving}>
                {saving ? 'Saving changes...' : 'Save Profile Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-900">My Orders</CardTitle>
            <CardDescription>See your order history and quickly review previous purchases.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ordersLoading ? (
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                Loading your orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <Package className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-3 text-base font-semibold text-slate-900">No orders yet</p>
                <p className="mt-2 text-sm text-slate-600">
                  Once you place an order, it will appear here in your account.
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                        Order ID
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-slate-900">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="space-y-2 text-left sm:text-right">
                      <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-slate-700 ring-1 ring-slate-200">
                        {order.status}
                      </span>
                      <p className="text-lg font-bold text-slate-900">INR {order.total_amount.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {order.order_items.map((item, index) => (
                      <div key={`${order.id}-${item.product_id}-${index}`} className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="h-16 w-16 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{item.product_name}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            Size: {item.size || '-'} | Color: {item.color || '-'} | Qty: {item.quantity}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            INR {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200">
                    <p><span className="font-semibold text-slate-900">Delivery Address:</span> {order.customer_address || '-'}</p>
                    <p className="mt-1"><span className="font-semibold text-slate-900">Phone:</span> {order.customer_phone || '-'}</p>
                    {order.customer_email && (
                      <p className="mt-1"><span className="font-semibold text-slate-900">Email:</span> {order.customer_email}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
