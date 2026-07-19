import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import { 
  Loader2, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ArrowLeft,
  Building2,
  FileText,
  Globe,
  MessageSquare,
  CheckCircle
} from 'lucide-react';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  
  // Business details (Step 2)
  const [businessName, setBusinessName] = useState('');
  const [cacNumber, setCacNumber] = useState('');
  const [cacDocumentUrl, setCacDocumentUrl] = useState('');
  const [hasWebsite, setHasWebsite] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [wantsWebsite, setWantsWebsite] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      const result = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`
        }
      });
      if (result.error) {
        toast.error(result.error.message || 'Could not sign up with Google');
        setGoogleLoading(false);
      }
      // On success, the browser redirects to Google — the AuthContext
      // will create a default 'user' profile automatically on return.
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
      setGoogleLoading(false);
    }
  };

  // Fetch categories and cities when moving to step 2
  const fetchCategoriesAndCities = async () => {
    try {
      const [{ data: cats }, { data: cts }] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('cities').select('*').order('name')
      ]);
      setCategories(cats || []);
      setCities(cts || []);
    } catch (err) {
      console.log('Could not fetch categories/cities');
    }
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (role === 'owner') {
      // Move to step 2 for business owners
      await fetchCategoriesAndCities();
      setStep(2);
    } else {
      // Regular user - complete signup
      await completeSignup();
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();

    if (!businessName || !cacNumber) {
      toast.error('Please fill in business name and CAC number');
      return;
    }

    if (!selectedCategory || !selectedCity) {
      toast.error('Please select a category and city');
      return;
    }

    await completeSignup();
  };

  const completeSignup = async () => {
    setLoading(true);

    try {
      const { data, error } = await signUp(email, password, fullName);
      
      if (error) {
        let errorMsg = error.message || 'Failed to create account';
        if (errorMsg.includes('body stream') || errorMsg.includes('json')) {
          errorMsg = 'Signup failed. Please try again.';
        } else if (errorMsg.includes('429') || errorMsg.includes('rate')) {
          errorMsg = 'Too many attempts. Please wait a minute and try again.';
        }
        toast.error(errorMsg);
        return;
      }
      
      // Create user profile with role
      if (data?.user) {
        try {
          // CRITICAL FIX: Wait for profile creation to complete
          const { data: profileData, error: profileError } = await supabase
            .from('users')
            .upsert({
              id: data.user.id,
              email: email,
              full_name: fullName,
              role: role  // This sets the role correctly
            }, { onConflict: 'id' })
            .select()
            .single();

          if (profileError) {
            console.error('Profile creation error:', profileError);
          } else {
            console.log('Profile created with role:', profileData?.role);
          }

          // If business owner, create the business
          if (role === 'owner') {
            const { data: newBusiness, error: bizError } = await supabase
              .from('businesses')
              .insert({
                owner_id: data.user.id,
                name: businessName,
                category_id: selectedCategory,
                city_id: selectedCity,
                address: businessAddress,
                phone: businessPhone,
                website: hasWebsite === 'yes' ? websiteUrl : '',
                description: businessDescription,
                cac_number: cacNumber,
                cac_document_url: cacDocumentUrl,
                wants_website: wantsWebsite === 'yes',
                status: 'pending',
                approved: false
              })
              .select()
              .single();

            if (bizError) {
              console.log('Business creation note:', bizError.message);
            } else {
              console.log('Business created:', newBusiness?.name);
            }
          }
        } catch (profileErr) {
          console.error('Profile/business setup error:', profileErr);
        }
      }
      
      // Check if email confirmation is required
      if (data?.user?.identities?.length === 0) {
        toast.success('Account created! Check your email to confirm.');
        navigate('/login');
      } else {
        toast.success('Account created successfully!');
        
        // CRITICAL FIX: Use the role variable directly instead of profile state
        // This ensures correct redirect before AuthContext updates
        if (role === 'owner') {
          console.log('Redirecting to /owner (business dashboard)');
          navigate('/owner', { replace: true });
        } else if (role === 'admin') {
          console.log('Redirecting to /admin');
          navigate('/admin', { replace: true });
        } else {
          console.log('Redirecting to /dashboard (user dashboard)');
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-stone-50 py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-emerald-800 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">OB</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-stone-900">
            {step === 1 ? 'Create Account' : 'Business Details'}
          </h1>
          <p className="text-stone-500 mt-2">
            {step === 1 ? 'Join Oyo Biz today' : 'Tell us about your business'}
          </p>
          
          {/* Step indicator for business owners */}
          {role === 'owner' && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'
              }`}>
                1
              </div>
              <div className={`w-12 h-1 ${step >= 2 ? 'bg-emerald-600' : 'bg-stone-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'
              }`}>
                2
              </div>
            </div>
          )}
        </div>

        <Card className="border-stone-200 shadow-sm" data-testid="signup-card">
          <CardContent className="pt-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-stone-300 text-stone-700 hover:bg-stone-50 rounded-lg mb-5"
                  onClick={handleGoogleSignUp}
                  disabled={googleLoading}
                  data-testid="google-signup-btn"
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
                <p className="text-xs text-stone-400 text-center mb-4">
                  Signs you up as a regular user. Listing a business? Use the form below instead.
                </p>

                <div className="flex items-center gap-3 mb-5">
                  <div className="h-px bg-stone-200 flex-1" />
                  <span className="text-xs text-stone-400 uppercase tracking-wide">or</span>
                  <div className="h-px bg-stone-200 flex-1" />
                </div>
              </>
            )}
            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-4" data-testid="signup-form-step1">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 h-12"
                      required
                      data-testid="fullname-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
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
                      data-testid="password-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
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
                      data-testid="confirm-password-input"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Account Type</Label>
                  <RadioGroup value={role} onValueChange={setRole} className="grid grid-cols-2 gap-4" data-testid="role-selector">
                    <div>
                      <RadioGroupItem value="user" id="user" className="sr-only" data-testid="role-user" />
                      <Label 
                        htmlFor="user" 
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          role === 'user' 
                            ? 'border-emerald-600 bg-emerald-50' 
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <User className={`w-6 h-6 ${role === 'user' ? 'text-emerald-600' : 'text-stone-400'}`} />
                        <span className={`font-medium ${role === 'user' ? 'text-emerald-700' : 'text-stone-600'}`}>
                          Regular User
                        </span>
                        <span className="text-xs text-stone-500 text-center">
                          Browse & review businesses
                        </span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="owner" id="owner" className="sr-only" data-testid="role-owner" />
                      <Label 
                        htmlFor="owner" 
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          role === 'owner' 
                            ? 'border-emerald-600 bg-emerald-50' 
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <Building2 className={`w-6 h-6 ${role === 'owner' ? 'text-emerald-600' : 'text-stone-400'}`} />
                        <span className={`font-medium ${role === 'owner' ? 'text-emerald-700' : 'text-stone-600'}`}>
                          Business Owner
                        </span>
                        <span className="text-xs text-stone-500 text-center">
                          List your business
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg"
                  disabled={loading}
                  data-testid="signup-step1-submit"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {role === 'owner' ? 'Continue' : 'Create Account'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Step 2: Business Details (for business owners only) */}
            {step === 2 && (
              <form onSubmit={handleStep2Submit} className="space-y-4" data-testid="signup-form-step2">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <Input
                      id="businessName"
                      type="text"
                      placeholder="Your Business Name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="pl-10 h-12"
                      required
                      data-testid="business-name-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger data-testid="category-select">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>City *</Label>
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                      <SelectTrigger data-testid="city-select">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cacNumber">CAC Registration Number *</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <Input
                      id="cacNumber"
                      type="text"
                      placeholder="RC123456 or BN123456"
                      value={cacNumber}
                      onChange={(e) => setCacNumber(e.target.value)}
                      className="pl-10 h-12"
                      required
                      data-testid="cac-number-input"
                    />
                  </div>
                  <p className="text-xs text-stone-500">Enter your Corporate Affairs Commission registration number</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cacDocument">CAC Document URL</Label>
                  <Input
                    id="cacDocument"
                    type="url"
                    placeholder="https://drive.google.com/your-cac-document"
                    value={cacDocumentUrl}
                    onChange={(e) => setCacDocumentUrl(e.target.value)}
                    className="h-12"
                    data-testid="cac-document-input"
                  />
                  <p className="text-xs text-stone-500">Upload your CAC certificate to Google Drive or Dropbox and paste the link</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Business Phone</Label>
                  <Input
                    id="businessPhone"
                    type="tel"
                    placeholder="+234 xxx xxx xxxx"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    className="h-12"
                    data-testid="business-phone-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Input
                    id="businessAddress"
                    type="text"
                    placeholder="Enter your business address"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    className="h-12"
                    data-testid="business-address-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessDescription">Business Description</Label>
                  <Textarea
                    id="businessDescription"
                    placeholder="Tell us about your business..."
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    rows={3}
                    data-testid="business-description-input"
                  />
                </div>

                {/* Website Question */}
                <div className="space-y-3 p-4 bg-stone-50 rounded-lg">
                  <Label className="text-base font-medium">Do you have a website?</Label>
                  <RadioGroup value={hasWebsite} onValueChange={setHasWebsite} className="flex gap-4" data-testid="has-website-selector">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="website-yes" data-testid="has-website-yes" />
                      <Label htmlFor="website-yes" className="font-normal cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="website-no" data-testid="has-website-no" />
                      <Label htmlFor="website-no" className="font-normal cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>

                  {hasWebsite === 'yes' && (
                    <div className="space-y-2 mt-3">
                      <Label htmlFor="websiteUrl">Website URL</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <Input
                          id="websiteUrl"
                          type="url"
                          placeholder="https://yourbusiness.com"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          className="pl-10 h-12"
                          data-testid="website-url-input"
                        />
                      </div>
                    </div>
                  )}

                  {hasWebsite === 'no' && (
                    <div className="space-y-3 mt-3">
                      <Label className="text-sm">Would you like us to create a website for your business?</Label>
                      <RadioGroup value={wantsWebsite} onValueChange={setWantsWebsite} className="flex gap-4" data-testid="wants-website-selector">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="wants-yes" data-testid="wants-website-yes" />
                          <Label htmlFor="wants-yes" className="font-normal cursor-pointer">Yes, I'm interested</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="wants-no" data-testid="wants-website-no" />
                          <Label htmlFor="wants-no" className="font-normal cursor-pointer">No, thanks</Label>
                        </div>
                      </RadioGroup>

                      {wantsWebsite === 'yes' && (
                        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <p className="text-sm text-emerald-800 mb-3">
                            Great! Our team can help you create a professional website for your business.
                          </p>
                          <Link to="/contact-admin" target="_blank">
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-100"
                              data-testid="contact-admin-btn"
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Contact Admin for Website
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 h-12"
                    data-testid="back-btn"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 bg-emerald-800 hover:bg-emerald-700 text-white"
                    disabled={loading}
                    data-testid="signup-step2-submit"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Create Account
                        <CheckCircle className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-stone-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-700 hover:text-emerald-600 font-medium" data-testid="login-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
export default Signup;
