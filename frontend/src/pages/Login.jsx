import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const { signInWithOtp, signInWithGoogle, user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [googleLoading, setGoogleLoading] = useState(false);

  const from = location.state?.from?.pathname;

  // Redirect if already logged in (covers both normal login and returning via magic link)
  useEffect(() => {
    if (user && profile) {
      redirectBasedOnRole(profile.role);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile]);

  const redirectBasedOnRole = (role) => {
    if (from) {
      navigate(from, { replace: true });
    } else if (role === 'admin') {
      navigate('/admin', { replace: true });
    } else if (role === 'owner') {
      navigate('/owner', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        toast.error(result.error.message || 'Could not sign in with Google');
        setGoogleLoading(false);
      }
      // On success, the browser redirects to Google, so no further action here.
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);

    try {
      const result = await signInWithOtp(email);

      if (result.error) {
        toast.error(result.error.message || 'Could not send login link');
      } else {
        setLinkSent(true);
        toast.success('Check your email for the login link');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-stone-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-emerald-800 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">OB</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-stone-900">Welcome Back</h1>
          <p className="text-stone-500 mt-2">
            {linkSent
              ? 'We sent you a login link'
              : "We'll email you a link to sign in — no password needed"}
          </p>
        </div>

        <Card className="border-stone-200 shadow-sm" data-testid="login-card">
          <CardContent className="pt-6">
            {linkSent ? (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto" />
                <p className="text-stone-700 font-medium">Check your inbox</p>
                <p className="text-stone-500 text-sm">
                  We sent a login link to <span className="font-medium">{email}</span>.
                  Click it to sign in.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={() => setLinkSent(false)}
                >
                  Use a different email
                </Button>
              </div>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-stone-300 text-stone-700 hover:bg-stone-50 hover:text-stone-700 rounded-lg"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  data-testid="google-signin-btn"
                >
                  {googleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3.02h3.88c2.27-2.09 3.57-5.17 3.57-8.84z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.02c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24z"/>
                        <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.62H1.27a12 12 0 0 0 0 10.76l4-3.11z"/>
                        <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.62l4 3.11C6.22 6.88 8.87 4.77 12 4.77z"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-3 my-5">
                  <div className="h-px bg-stone-200 flex-1" />
                  <span className="text-xs text-stone-400 uppercase tracking-wide">or</span>
                  <div className="h-px bg-stone-200 flex-1" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
                <div className="space-y-2">
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
                      data-testid="email-input"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg"
                  disabled={loading}
                  data-testid="login-submit"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-stone-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-emerald-700 hover:text-emerald-600 font-medium" data-testid="signup-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;