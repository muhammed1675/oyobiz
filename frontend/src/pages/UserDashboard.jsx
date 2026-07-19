import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import {
  User,
  Heart,
  Star,
  Building2,
  Loader2,
  Save,
  MapPin,
  Trash2,
  Store,
  ArrowRight
} from 'lucide-react';

const UserDashboard = () => {
  const { user, profile, updateProfile, isOwner } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || ''
      });
    }
    fetchUserData();
  }, [profile]);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      // Fetch favorites
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select(`
          id,
          business:businesses(
            id,
            name,
            city:cities(name),
            category:categories(name),
            photos:business_photos(photo_url)
          )
        `)
        .eq('user_id', user.id);
      setFavorites(favoritesData || []);

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select(`
          *,
          business:businesses(id, name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setReviews(reviewsData || []);
    } catch (error) {
      console.log('Error fetching user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await updateProfile(formData);
      if (error) {
        toast.error(error.message || 'Failed to update profile');
      } else {
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const removeFavorite = async (favoriteId) => {
    try {
      await supabase.from('favorites').delete().eq('id', favoriteId);
      setFavorites(favorites.filter(f => f.id !== favoriteId));
      toast.success('Removed from favorites');
    } catch (error) {
      toast.error('Failed to remove favorite');
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      await supabase.from('reviews').delete().eq('id', reviewId);
      setReviews(reviews.filter(r => r.id !== reviewId));
      toast.success('Review deleted');
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const getRoleBadge = () => {
    if (profile?.role === 'admin') {
      return <Badge className="bg-purple-100 text-purple-700">Administrator</Badge>;
    } else if (profile?.role === 'owner') {
      return <Badge className="bg-blue-100 text-blue-700">Business Owner</Badge>;
    }
    return <Badge className="bg-stone-100 text-stone-700">User</Badge>;
  };

  return (
    <div className="min-h-screen bg-stone-50" data-testid="user-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-stone-900">My Account</h1>
              {getRoleBadge()}
            </div>
            <p className="text-stone-500">Manage your profile, favorites, and reviews</p>
          </div>
          
          {/* Quick action for business owners */}
          {isOwner && (
            <Link to="/owner">
              <Button className="bg-emerald-800 hover:bg-emerald-700" data-testid="go-to-business-dashboard">
                <Store className="w-4 h-4 mr-2" />
                Business Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white border border-stone-200">
            <TabsTrigger value="profile" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700" data-testid="tab-profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700" data-testid="tab-favorites">
              <Heart className="w-4 h-4 mr-2" />
              Favorites ({favorites.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700" data-testid="tab-reviews">
              <Star className="w-4 h-4 mr-2" />
              Reviews ({reviews.length})
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card data-testid="profile-card">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md" data-testid="profile-form">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="bg-stone-50"
                    />
                    <p className="text-xs text-stone-500">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Your full name"
                      data-testid="fullname-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+234 xxx xxx xxxx"
                      data-testid="phone-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <div className="flex items-center gap-2">
                      {getRoleBadge()}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-emerald-800 hover:bg-emerald-700"
                    data-testid="save-profile-btn"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : favorites.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Heart className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">No favorites yet</h3>
                  <p className="text-stone-500 mb-4">Save businesses you love for quick access</p>
                  <Link to="/search">
                    <Button variant="outline">Browse Businesses</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="favorites-grid">
                {favorites.map((fav) => (
                  <Card key={fav.id} className="overflow-hidden" data-testid={`favorite-${fav.id}`}>
                    <div className="aspect-video relative bg-stone-200">
                      {fav.business?.photos?.[0]?.photo_url ? (
                        <img
                          src={fav.business.photos[0].photo_url}
                          alt={fav.business.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-emerald-100">
                          <Building2 className="w-12 h-12 text-emerald-300" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <Link to={`/business/${fav.business?.id}`}>
                        <h3 className="font-semibold text-stone-900 hover:text-emerald-700 transition-colors">
                          {fav.business?.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-stone-500 mt-1">
                        <MapPin className="w-3 h-3" />
                        {fav.business?.city?.name}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFavorite(fav.id)}
                        className="mt-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                        data-testid={`remove-favorite-${fav.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : reviews.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Star className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">No reviews yet</h3>
                  <p className="text-stone-500 mb-4">Share your experience with businesses</p>
                  <Link to="/search">
                    <Button variant="outline">Browse Businesses</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4" data-testid="reviews-list">
                {reviews.map((review) => (
                  <Card key={review.id} data-testid={`review-${review.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link to={`/business/${review.business?.id}`}>
                            <h3 className="font-semibold text-stone-900 hover:text-emerald-700 transition-colors">
                              {review.business?.name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-stone-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-stone-400">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-stone-600 mt-2">{review.comment}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteReview(review.id)}
                          className="text-stone-400 hover:text-red-500"
                          data-testid={`delete-review-${review.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
