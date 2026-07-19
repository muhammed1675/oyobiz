import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '../components/ui/dialog';
import { toast } from 'sonner';
import {
  Store,
  Plus,
  Edit,
  Trash2,
  Loader2,
  MapPin,
  Phone,
  Globe,
  Star,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  User,
  ArrowRight,
  Building2,
  Upload,
  Image as ImageIcon,
  X,
  FileText
} from 'lucide-react';

const OwnerDashboard = () => {
  const { user, profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    city_id: '',
    address: '',
    phone: '',
    website: '',
    description: '',
    cac_number: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Update role to owner if not already
    if (profile && profile.role === 'user') {
      updateProfile({ role: 'owner' }).catch(() => {});
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const fetchData = async () => {
    try {
      // Fetch categories and cities
      const [categoriesResult, citiesResult] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('cities').select('*').order('name')
      ]);
      
      setCategories(categoriesResult.data || []);
      setCities(citiesResult.data || []);

      // Fetch owner's businesses
      if (user) {
        const { data: businessesData } = await supabase
          .from('businesses')
          .select(`
            *,
            category:categories(name),
            city:cities(name),
            photos:business_photos(id, photo_url),
            reviews:reviews(rating)
          `)
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });
        setBusinesses(businessesData || []);
      }
    } catch (error) {
      console.log('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category_id: '',
      city_id: '',
      address: '',
      phone: '',
      website: '',
      description: '',
      cac_number: ''
    });
    setPhotoFile(null);
    setPhotoPreview('');
    setEditingBusiness(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadPhoto = async (businessId) => {
    if (!photoFile) return null;
    
    setUploadingPhoto(true);
    try {
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${businessId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('business-photos')
        .upload(fileName, photoFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Upload error:', error);
        // If storage bucket doesn't exist, fall back to data URL
        if (error.message?.includes('not found') || error.message?.includes('Bucket')) {
          toast.info('Storage not configured - saving image reference');
          return photoPreview; // Return the base64 data URL as fallback
        }
        throw error;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('business-photos')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (error) {
      console.error('Photo upload failed:', error);
      // Return base64 as fallback if storage fails
      return photoPreview;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category_id || !formData.city_id || !formData.cac_number) {
      toast.error('Please fill in all required fields (Name, Category, City, CAC Number)');
      return;
    }

    setSaving(true);
    try {
      if (editingBusiness) {
        const { error } = await supabase
          .from('businesses')
          .update({
            ...formData,
            status: 'pending'
          })
          .eq('id', editingBusiness.id);

        if (error) throw error;

        // Upload photo if selected
        if (photoFile) {
          const photoUrl = await uploadPhoto(editingBusiness.id);
          if (photoUrl) {
            await supabase
              .from('business_photos')
              .insert({ business_id: editingBusiness.id, photo_url: photoUrl });
          }
        }

        toast.success('Business updated! Awaiting admin approval.');
      } else {
        const { data: newBusiness, error } = await supabase
          .from('businesses')
          .insert({
            ...formData,
            owner_id: user.id,
            status: 'pending',
            approved: false
          })
          .select()
          .single();

        if (error) throw error;

        // Upload photo if selected
        if (photoFile && newBusiness) {
          const photoUrl = await uploadPhoto(newBusiness.id);
          if (photoUrl) {
            await supabase
              .from('business_photos')
              .insert({ business_id: newBusiness.id, photo_url: photoUrl });
          }
        }

        toast.success('Business submitted! Awaiting admin approval.');
      }

      setShowAddDialog(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to save business');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (business) => {
    setEditingBusiness(business);
    setFormData({
      name: business.name,
      category_id: business.category_id,
      city_id: business.city_id,
      address: business.address || '',
      phone: business.phone || '',
      website: business.website || '',
      description: business.description || '',
      cac_number: business.cac_number || ''
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (businessId) => {
    if (!confirm('Are you sure you want to delete this business?')) return;

    try {
      await supabase.from('business_photos').delete().eq('business_id', businessId);
      await supabase.from('reviews').delete().eq('business_id', businessId);
      await supabase.from('favorites').delete().eq('business_id', businessId);
      await supabase.from('businesses').delete().eq('id', businessId);

      toast.success('Business deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete business');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return null;
    return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  };

  const hasSetupIssue = categories.length === 0 && cities.length === 0;

  return (
    <div className="min-h-screen bg-stone-50" data-testid="owner-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Store className="w-8 h-8 text-emerald-600" />
              <h1 className="text-2xl md:text-3xl font-bold text-stone-900">Business Dashboard</h1>
            </div>
            <p className="text-stone-500">Manage and list your businesses in Oyo State</p>
          </div>
          
          <div className="flex gap-3">
            <Link to="/dashboard">
              <Button variant="outline" data-testid="go-to-profile">
                <User className="w-4 h-4 mr-2" />
                My Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Setup Warning */}
        {!loading && hasSetupIssue && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-amber-800 mb-2">Database Setup Required</h3>
              <p className="text-sm text-amber-700">
                The database tables haven't been set up yet. Please run the SQL commands from the 
                <code className="px-1 py-0.5 bg-amber-100 rounded mx-1">setup.md</code> 
                file in your Supabase SQL Editor to create tables, categories, and cities.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Welcome Card for New Owners */}
        {!loading && businesses.length === 0 && !hasSetupIssue && (
          <Card className="mb-8 bg-gradient-to-br from-emerald-800 to-emerald-900 text-white border-0">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Welcome, Business Owner!</h2>
                  <p className="text-emerald-200 max-w-lg">
                    Ready to showcase your business to thousands of potential customers in Oyo State? 
                    Add your first business listing now and get discovered.
                  </p>
                </div>
                <Dialog open={showAddDialog} onOpenChange={(open) => {
                  setShowAddDialog(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-lime-500 hover:bg-lime-400 text-emerald-900 font-semibold" data-testid="add-first-business-btn">
                      <Plus className="w-5 h-5 mr-2" />
                      Add Your First Business
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingBusiness ? 'Edit Business' : 'Register Your Business'}</DialogTitle>
                      <DialogDescription>
                        Fill in the details below to list your business on Oyo Biz
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4" data-testid="business-form">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Business Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter business name"
                            required
                            data-testid="business-name-input"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Select
                            value={formData.category_id}
                            onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                          >
                            <SelectTrigger data-testid="business-category-select">
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
                          <Label htmlFor="city">City *</Label>
                          <Select
                            value={formData.city_id}
                            onValueChange={(value) => setFormData({ ...formData, city_id: value })}
                          >
                            <SelectTrigger data-testid="business-city-select">
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

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+234 xxx xxx xxxx"
                            data-testid="business-phone-input"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cac_number">CAC Registration Number *</Label>
                          <Input
                            id="cac_number"
                            value={formData.cac_number}
                            onChange={(e) => setFormData({ ...formData, cac_number: e.target.value })}
                            placeholder="RC123456 or BN123456"
                            required
                            data-testid="business-cac-input"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Enter full address"
                            data-testid="business-address-input"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            placeholder="https://example.com"
                            data-testid="business-website-input"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe your business, services, and what makes you unique..."
                            rows={4}
                            data-testid="business-description-input"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label>Business Photo</Label>
                          <div className="border-2 border-dashed border-stone-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
                            {photoPreview ? (
                              <div className="relative">
                                <img 
                                  src={photoPreview} 
                                  alt="Preview" 
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={removePhoto}
                                  data-testid="remove-photo-btn"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center h-32 cursor-pointer">
                                <Upload className="w-8 h-8 text-stone-400 mb-2" />
                                <span className="text-sm text-stone-500">Click to upload photo</span>
                                <span className="text-xs text-stone-400 mt-1">PNG, JPG up to 5MB</span>
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileSelect}
                                  className="hidden"
                                  data-testid="business-photo-input"
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowAddDialog(false);
                            resetForm();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={saving || hasSetupIssue || uploadingPhoto}
                          className="bg-emerald-800 hover:bg-emerald-700"
                          data-testid="submit-business-btn"
                        >
                          {(saving || uploadingPhoto) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                          {uploadingPhoto ? 'Uploading...' : editingBusiness ? 'Update Business' : 'Submit for Approval'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats - Only show if has businesses */}
        {businesses.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-stone-900">Your Businesses</h2>
              <Dialog open={showAddDialog} onOpenChange={(open) => {
                setShowAddDialog(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-800 hover:bg-emerald-700" data-testid="add-business-btn" disabled={hasSetupIssue}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Business
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingBusiness ? 'Edit Business' : 'Register Your Business'}</DialogTitle>
                    <DialogDescription>
                      Fill in the details below to list your business on Oyo Biz
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4" data-testid="business-form">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Business Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter business name"
                          required
                          data-testid="business-name-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={formData.category_id}
                          onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                        >
                          <SelectTrigger data-testid="business-category-select">
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
                        <Label htmlFor="city">City *</Label>
                        <Select
                          value={formData.city_id}
                          onValueChange={(value) => setFormData({ ...formData, city_id: value })}
                        >
                          <SelectTrigger data-testid="business-city-select">
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

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+234 xxx xxx xxxx"
                          data-testid="business-phone-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cac_number">CAC Registration Number *</Label>
                        <Input
                          id="cac_number"
                          value={formData.cac_number}
                          onChange={(e) => setFormData({ ...formData, cac_number: e.target.value })}
                          placeholder="RC123456 or BN123456"
                          required
                          data-testid="business-cac-input"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Enter full address"
                          data-testid="business-address-input"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          placeholder="https://example.com"
                          data-testid="business-website-input"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Describe your business, services, and what makes you unique..."
                          rows={4}
                          data-testid="business-description-input"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Business Photo</Label>
                        <div className="border-2 border-dashed border-stone-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
                          {photoPreview ? (
                            <div className="relative">
                              <img 
                                src={photoPreview} 
                                alt="Preview" 
                                className="w-full h-48 object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={removePhoto}
                                data-testid="remove-photo-btn"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center h-32 cursor-pointer">
                              <Upload className="w-8 h-8 text-stone-400 mb-2" />
                              <span className="text-sm text-stone-500">Click to upload photo</span>
                              <span className="text-xs text-stone-400 mt-1">PNG, JPG up to 5MB</span>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                                data-testid="business-photo-input"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddDialog(false);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={saving || hasSetupIssue || uploadingPhoto}
                        className="bg-emerald-800 hover:bg-emerald-700"
                        data-testid="submit-business-btn"
                      >
                        {(saving || uploadingPhoto) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        {uploadingPhoto ? 'Uploading...' : editingBusiness ? 'Update Business' : 'Submit for Approval'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Store className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-stone-900">{businesses.length}</p>
                      <p className="text-sm text-stone-500">Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-stone-900">
                        {businesses.filter(b => b.status === 'approved').length}
                      </p>
                      <p className="text-sm text-stone-500">Approved</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-stone-900">
                        {businesses.filter(b => b.status === 'pending').length}
                      </p>
                      <p className="text-sm text-stone-500">Pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-stone-900">
                        {businesses.reduce((sum, b) => sum + (b.reviews?.length || 0), 0)}
                      </p>
                      <p className="text-sm text-stone-500">Reviews</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Businesses List */}
            <div className="space-y-4" data-testid="businesses-list">
              {businesses.map((business) => (
                <Card key={business.id} className="overflow-hidden" data-testid={`business-item-${business.id}`}>
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-48 h-48 md:h-auto bg-stone-200 flex-shrink-0">
                        {business.photos?.[0]?.photo_url ? (
                          <img
                            src={business.photos[0].photo_url}
                            alt={business.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-emerald-100">
                            <Building2 className="w-12 h-12 text-emerald-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-stone-900">{business.name}</h3>
                              {getStatusBadge(business.status)}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500 mb-3">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {business.city?.name}
                              </span>
                              <span>{business.category?.name}</span>
                              {getAverageRating(business.reviews) && (
                                <span className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                  {getAverageRating(business.reviews)} ({business.reviews?.length} reviews)
                                </span>
                              )}
                            </div>
                            <p className="text-stone-600 text-sm line-clamp-2">
                              {business.description || 'No description'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(business)}
                              data-testid={`edit-business-${business.id}`}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(business.id)}
                              data-testid={`delete-business-${business.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
