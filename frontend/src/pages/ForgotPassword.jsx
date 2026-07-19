import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message || 'Failed to send reset email');
      } else {
        setEmailSent(true);
        toast.success('Password reset email sent! Check your inbox.');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-stone-50 py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl">Check Your Email</CardTitle>
              <CardDescription className="text-base mt-2">
                We've sent a password reset link to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                <p className="text-sm text-stone-600">
                  Click the link in the email to reset your password. The link will expire in 1 hour.
                </p>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-stone-500 text-center">
                  Didn't receive the email?
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                >
                  Try Another Email
                </Button>
              </div>

              <div className="pt-4">
                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-stone-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-emerald-800 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">OB</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-stone-900">Forgot Password?</h1>
          <p className="text-stone-500 mt-2">
            No worries, we'll send you reset instructions
          </p>
        </div>

        <Card className="border-stone-200 shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-emerald-700 hover:text-emerald-600 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
