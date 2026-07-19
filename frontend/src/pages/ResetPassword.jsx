import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Loader2, Lock, CheckCircle, AlertCircle } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          setValidToken(false);
        } else {
          setValidToken(true);
        }
      } catch (err) {
        setValidToken(false);
      } finally {
        setCheckingToken(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error('Please enter and confirm your new password');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast.error(error.message || 'Failed to reset password');
      } else {
        setResetComplete(true);
        toast.success('Password reset successfully!');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-stone-50 py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl">Invalid or Expired Link</CardTitle>
              <CardDescription className="text-base mt-2">
                This password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                <p className="text-sm text-stone-600">
                  Password reset links expire after 1 hour. Please request a new one.
                </p>
              </div>
              
              <Link to="/forgot-password">
                <Button className="w-full bg-emerald-800 hover:bg-emerald-700">
                  Request New Reset Link
                </Button>
              </Link>

              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (resetComplete) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-stone-50 py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl">Password Reset!</CardTitle>
              <CardDescription className="text-base mt-2">
                Your password has been successfully reset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-stone-600 text-center">
                  Redirecting you to login...
                </p>
              </div>
              
              <Link to="/login">
                <Button className="w-full bg-emerald-800 hover:bg-emerald-700">
                  Go to Login
                </Button>
              </Link>
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
          <h1 className="text-2xl font-bold text-stone-900">Reset Password</h1>
          <p className="text-stone-500 mt-2">
            Enter your new password below
          </p>
        </div>

        <Card className="border-stone-200 shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12"
                    required
                    autoFocus
                  />
                </div>
                <p className="text-xs text-stone-500">At least 6 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-12"
                    required
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
                  'Reset Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
