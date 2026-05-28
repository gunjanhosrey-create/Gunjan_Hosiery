import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

export default function ResetPasswordPage() {
  const { loading, session, updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const hasRecoverySession = Boolean(session);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!hasRecoverySession) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full border-slate-200 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.35)]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-900">Invalid reset session</CardTitle>
            <CardDescription>
              Open the password reset link from your email, then try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/login">Back to login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full border-slate-200 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.35)]">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-slate-900">Reset password</CardTitle>
          <CardDescription>
            Enter your new password below and save it securely.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();

              if (password !== confirmPassword) {
                toast.error('Passwords do not match');
                return;
              }

              setSubmitting(true);
              const { error } = await updatePassword(password);

              if (error) {
                toast.error(error.message);
              } else {
                toast.success('Password updated successfully');
                setPassword('');
                setConfirmPassword('');
              }

              setSubmitting(false);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm Password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Updating password...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
