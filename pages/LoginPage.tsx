import { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const mobileRegex = /^[6-9]\d{9}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const initialSignIn = {
  email: '',
  password: '',
};

const initialSignUp = {
  fullName: '',
  businessName: '',
  mobile: '',
  email: '',
  gstNumber: '',
  password: '',
};

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M21.6 12.23c0-.72-.06-1.25-.19-1.8H12v3.39h5.52c-.11.84-.73 2.1-2.1 2.95l-.02.11 3.05 2.31.21.02c1.91-1.73 2.94-4.26 2.94-6.98Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.87 6.61-2.36l-3.24-2.44c-.87.59-2.03 1.01-3.37 1.01-2.64 0-4.89-1.73-5.69-4.13l-.11.01-3.17 2.4-.04.1A9.98 9.98 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.31 14.08A5.9 5.9 0 0 1 5.98 12c0-.72.12-1.43.31-2.08l-.01-.14-3.21-2.44-.1.04A9.82 9.82 0 0 0 2 12c0 1.61.39 3.13 1.08 4.45l3.23-2.37Z" />
      <path fill="#EA4335" d="M12 5.79c1.69 0 2.83.72 3.48 1.33l2.54-2.42C16.95 3.74 14.7 3 12 3a9.98 9.98 0 0 0-8.93 5.41l3.32 2.54c.81-2.4 3.06-4.16 5.61-4.16Z" />
    </svg>
  );
}

function getAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'Invalid email or password. Please check your details and try again.';
  }

  if (normalized.includes('email not confirmed')) {
    return 'Please verify your email address before signing in.';
  }

  if (normalized.includes('already registered') || normalized.includes('already exists')) {
    return 'This email is already registered. Please sign in instead.';
  }

  return message;
}

export default function LoginPage() {
  const { user, loading, login, loginWithGoogle, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('signin');
  const [signInForm, setSignInForm] = useState(initialSignIn);
  const [signUpForm, setSignUpForm] = useState(initialSignUp);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const redirectTo =
    typeof location.state === 'object' &&
    location.state &&
    'from' in location.state &&
    typeof location.state.from === 'string'
      ? location.state.from
      : '/b2b-dashboard';

  const normalizedGst = signUpForm.gstNumber.trim().toUpperCase();
  const gstState = useMemo(() => {
    if (!normalizedGst) return 'empty';
    return gstRegex.test(normalizedGst) ? 'valid' : 'invalid';
  }, [normalizedGst]);

  const handleGoogleAuth = async () => {
    setSubmitting(true);
    setStatus(null);

    const { error } = await loginWithGoogle();

    if (error) {
      setStatus({ type: 'error', message: getAuthErrorMessage(error.message) });
      setSubmitting(false);
      return;
    }

    toast.success('Redirecting to Google...');
  };

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    const { error } = await login(signInForm.email, signInForm.password);

    if (error) {
      setStatus({ type: 'error', message: getAuthErrorMessage(error.message) });
      setSubmitting(false);
      return;
    }

    toast.success('Signed in successfully');
    navigate(redirectTo, { replace: true });
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    if (!mobileRegex.test(signUpForm.mobile.trim())) {
      setStatus({ type: 'error', message: 'Please enter a valid 10-digit Indian mobile number.' });
      setSubmitting(false);
      return;
    }

    if (!gstRegex.test(normalizedGst)) {
      setStatus({ type: 'error', message: 'Invalid GSTIN. Please enter a valid 15-character GST number before creating your account.' });
      setSubmitting(false);
      return;
    }

    if (!passwordRegex.test(signUpForm.password)) {
      setStatus({ type: 'error', message: 'Password must be at least 8 characters and include uppercase, lowercase, and a number.' });
      setSubmitting(false);
      return;
    }

    const { error } = await signUp({
      fullName: signUpForm.fullName,
      businessName: signUpForm.businessName,
      phone: signUpForm.mobile,
      email: signUpForm.email,
      password: signUpForm.password,
      isDealer: true,
      gstNumber: normalizedGst,
      gstVerified: true,
    });

    if (error) {
      setStatus({ type: 'error', message: getAuthErrorMessage(error.message) });
      setSubmitting(false);
      return;
    }

    setStatus({
      type: 'success',
      message: 'Distributor account created. GSTIN format verified successfully. Please check your email if verification is enabled.',
    });
    toast.success('Distributor account created');
    setSignUpForm(initialSignUp);
    setActiveTab('signin');
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#fbf8f1]">
        <Loader2 className="h-8 w-8 animate-spin text-[#b7923c]" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/b2b-dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#fbf8f1]">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="order-2 lg:order-1">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#111] p-8 text-white shadow-[0_30px_90px_-45px_rgba(0,0,0,0.8)] sm:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(198,168,90,0.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_42%)]" />
            <div className="relative">
              <Badge className="rounded-full bg-[#c6a85a] px-3 py-1 text-black hover:bg-[#c6a85a]">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                B2B Distributor Portal
              </Badge>
              <h1 className="mt-8 max-w-xl text-4xl font-semibold leading-tight tracking-normal text-white sm:text-5xl">
                Wholesale fashion access for verified business buyers.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-8 text-white/70">
                Sign in to manage bulk purchases, wholesale pricing, GST-ready onboarding,
                invoices, shipments, and distributor support in one focused workspace.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: ShieldCheck, label: 'GST verified' },
                  { icon: LockKeyhole, label: 'Secure login' },
                  { icon: Truck, label: 'Bulk dispatch' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition hover:border-[#c6a85a]/60 hover:bg-white/10">
                      <Icon className="h-5 w-5 text-[#f2d488]" />
                      <p className="mt-3 text-sm font-medium text-white">{item.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c6a85a] text-black">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Built for fashion distributors</p>
                    <p className="mt-1 text-sm leading-6 text-white/65">
                      Meesho-style business onboarding, refined with a premium Gunjan Hosiery brand feel.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card className="order-1 overflow-hidden rounded-[2rem] border-[#e6ddcf] bg-white/95 shadow-[0_26px_80px_-48px_rgba(20,20,20,0.65)] backdrop-blur-xl lg:order-2">
          <CardContent className="p-0">
            <div className="border-b border-[#eee6da] px-6 py-6 sm:px-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#a27d2d]">
                    Gunjan Hosiery
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#111]">
                    Business account access
                  </h2>
                </div>
                <div className="hidden rounded-full border border-[#e6ddcf] bg-[#fbf8f1] px-3 py-2 text-xs font-medium text-[#6d6255] sm:block">
                  SSL secured
                </div>
              </div>
            </div>

            <div className="px-6 py-6 sm:px-8">
              <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); setStatus(null); }} className="w-full">
                <TabsList className="grid h-12 w-full grid-cols-2 rounded-full bg-[#f4eee4] p-1">
                  <TabsTrigger value="signin" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm">
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                {status && (
                  <Alert
                    variant={status.type === 'error' ? 'destructive' : 'default'}
                    className={`mt-5 rounded-2xl ${
                      status.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    {status.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertDescription>{status.message}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="signin" className="mt-6">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 w-full rounded-xl border-[#e0d6c6] bg-white hover:bg-[#fbf8f1]"
                      onClick={() => void handleGoogleAuth()}
                      disabled={submitting}
                    >
                      {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                      Continue with Google
                    </Button>

                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-[#eee6da]" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-[#8a8176]">or sign in with email</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email Address</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        value={signInForm.email}
                        onChange={(event) => setSignInForm((prev) => ({ ...prev, email: event.target.value }))}
                        placeholder="business@example.com"
                        className="h-12 rounded-xl border-[#e0d6c6] bg-[#fffdf9]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showPassword ? 'text' : 'password'}
                          value={signInForm.password}
                          onChange={(event) => setSignInForm((prev) => ({ ...prev, password: event.target.value }))}
                          placeholder="Enter your password"
                          className="h-12 rounded-xl border-[#e0d6c6] bg-[#fffdf9] pr-12"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8176] transition hover:text-black"
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="h-12 w-full rounded-xl bg-black text-white hover:bg-[#2b2b2b]" disabled={submitting}>
                      {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LockKeyhole className="mr-2 h-4 w-4" />}
                      {submitting ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-6">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name</Label>
                        <Input
                          id="signup-name"
                          value={signUpForm.fullName}
                          onChange={(event) => setSignUpForm((prev) => ({ ...prev, fullName: event.target.value }))}
                          placeholder="Owner name"
                          className="h-12 rounded-xl border-[#e0d6c6] bg-[#fffdf9]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-business">Business Name</Label>
                        <Input
                          id="signup-business"
                          value={signUpForm.businessName}
                          onChange={(event) => setSignUpForm((prev) => ({ ...prev, businessName: event.target.value }))}
                          placeholder="Retail / distributor firm"
                          className="h-12 rounded-xl border-[#e0d6c6] bg-[#fffdf9]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="signup-mobile">Mobile Number</Label>
                        <Input
                          id="signup-mobile"
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={signUpForm.mobile}
                          onChange={(event) => setSignUpForm((prev) => ({ ...prev, mobile: event.target.value.replace(/\D/g, '') }))}
                          placeholder="10-digit mobile"
                          className="h-12 rounded-xl border-[#e0d6c6] bg-[#fffdf9]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email Address</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          value={signUpForm.email}
                          onChange={(event) => setSignUpForm((prev) => ({ ...prev, email: event.target.value }))}
                          placeholder="business@example.com"
                          className="h-12 rounded-xl border-[#e0d6c6] bg-[#fffdf9]"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-gst">GST Number</Label>
                      <div className="relative">
                        <Input
                          id="signup-gst"
                          value={signUpForm.gstNumber}
                          onChange={(event) => setSignUpForm((prev) => ({ ...prev, gstNumber: event.target.value.toUpperCase() }))}
                          placeholder="22AAAAA0000A1Z5"
                          className={`h-12 rounded-xl bg-[#fffdf9] pr-12 uppercase ${
                            gstState === 'invalid'
                              ? 'border-red-400 focus-visible:ring-red-200'
                              : gstState === 'valid'
                              ? 'border-emerald-400 focus-visible:ring-emerald-200'
                              : 'border-[#e0d6c6]'
                          }`}
                          required
                        />
                        {gstState === 'valid' && (
                          <CheckCircle2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
                        )}
                      </div>
                      {gstState === 'valid' && (
                        <p className="flex items-center gap-2 text-sm text-emerald-700">
                          <BadgeCheck className="h-4 w-4" />
                          GSTIN format verified. Account creation is enabled.
                        </p>
                      )}
                      {gstState === 'invalid' && (
                        <p className="flex items-center gap-2 text-sm font-medium text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          Invalid GSTIN. Use 15 characters like 22AAAAA0000A1Z5.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signUpForm.password}
                        onChange={(event) => setSignUpForm((prev) => ({ ...prev, password: event.target.value }))}
                        placeholder="Minimum 8 characters"
                        className="h-12 rounded-xl border-[#e0d6c6] bg-[#fffdf9]"
                        required
                      />
                      <p className="text-xs text-[#7c7267]">
                        Use uppercase, lowercase, and a number for a stronger account.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="h-12 w-full rounded-xl bg-black text-white hover:bg-[#2b2b2b]"
                      disabled={submitting || gstState !== 'valid'}
                    >
                      {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Building2 className="mr-2 h-4 w-4" />}
                      {submitting ? 'Creating account...' : 'Create Distributor Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 grid gap-3 border-t border-[#eee6da] pt-5 sm:grid-cols-3">
                {['GST checked', 'Secure OAuth', 'Wholesale ready'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-[#5f574e]">
                    <ShieldCheck className="h-4 w-4 text-[#a27d2d]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
