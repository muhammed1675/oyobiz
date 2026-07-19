import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import {
  MapPin,
  Phone,
  Globe,
  Star,
  Heart,
  HeartOff,
  Building2,
  ChevronLeft,
  Loader2,
  Send,
  User,
  Clock,
  CheckCircle,
  MessageCircle
} from 'lucide-react';

const BusinessDetail = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  useEffect(() => {
    fetchBusiness();
    fetchReviews();
    if (user) {
      checkFavorite();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const fetchBusiness = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          category:categories(name),
          city:cities(name),
          photos:business_photos(id, photo_url),
          owner:users!businesses_owner_id_fkey(full_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setBusiness(data);
    } catch (error) {
      console.error('Error fetching business:', error);
      toast.error('Failed to load business details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:users(full_name),
          comments:comments(
            id,
            comment,
            created_at,
            user:users(full_name)
          )
        `)
        .eq('business_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const checkFavorite = async () => {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('business_id', id)
      .eq('user_id', user.id)
      .single();
    
    setIsFavorite(!!data);
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('business_id', id)
          .eq('user_id', user.id);
        toast.success('Removed from favorites');
      } else {
        await supabase
          .from('favorites')
          .insert({ business_id: id, user_id: user.id });
        toast.success('Added to favorites');
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      toast.error('Failed to update favorites');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to leave a review');
      return;
    }

    if (!reviewText.trim()) {
      toast.error('Please enter a review');
      return;
    }

    setSubmittingReview(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          business_id: id,
          user_id: user.id,
          rating: reviewRating,
          comment: reviewText.trim()
        });

      if (error) throw error;
      
      toast.success('Review submitted successfully!');
      setReviewText('');
      setReviewRating(5);
      fetchReviews();
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getWhatsAppLink = (phoneNumber) => {
    // Remove all non-digit characters including the + sign
    let cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // If the number doesn't start with a country code, assume Nigeria (+234)
    // and remove leading 0 if present
    if (!cleanPhone.startsWith('234') && cleanPhone.startsWith('0')) {
      cleanPhone = '234' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('234') && !cleanPhone.startsWith('0')) {
      cleanPhone = '234' + cleanPhone;
    }
    
    // Pre-filled message
    const message = encodeURIComponent(`Hi, I found your business "${business.name}" on *Oyo Biz Directory* and would like to inquire about your services.`);
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <Building2 className="w-16 h-16 text-stone-300 mb-4" />
        <h1 className="text-xl font-semibold text-stone-900 mb-2">Business not found</h1>
        <Link to="/search">
          <Button variant="outline">Browse Businesses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50" data-testid="business-detail">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/search" className="inline-flex items-center text-sm text-stone-500 hover:text-stone-700 mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to search
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <Card className="overflow-hidden" data-testid="photo-gallery">
              <div className="aspect-video relative bg-stone-200">
                {business.photos?.length > 0 ? (
                  <img
                    src={business.photos[selectedPhoto]?.photo_url}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-100">
                    <Building2 className="w-20 h-20 text-emerald-300" />
                  </div>
                )}
                {business.status === 'approved' && (
                  <Badge className="absolute top-4 left-4 bg-emerald-600 text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              {business.photos?.length > 1 && (
                <div className="p-3 flex gap-2 overflow-x-auto">
                  {business.photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => setSelectedPhoto(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedPhoto === index ? 'border-emerald-500' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={photo.photo_url}
                        alt={`${business.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Business Info */}
            <Card data-testid="business-info">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-stone-900 mb-2">
                      {business.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
                      {business.category && (
                        <Badge variant="secondary">{business.category.name}</Badge>
                      )}
                      {averageRating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-medium text-stone-700">{averageRating}</span>
                          <span>({reviews.length} reviews)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleFavorite}
                    disabled={favoriteLoading}
                    className={isFavorite ? 'text-red-500 border-red-200' : ''}
                    data-testid="favorite-btn"
                  >
                    {favoriteLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isFavorite ? (
                      <Heart className="w-5 h-5 fill-current" />
                    ) : (
                      <Heart className="w-5 h-5" />
                    )}
                  </Button>
                </div>

                <p className="text-stone-600 mb-6">
                  {business.description || 'No description available'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {business.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-stone-700">Address</p>
                        <p className="text-sm text-stone-500">{business.address}</p>
                        {business.city && (
                          <p className="text-sm text-stone-500">{business.city.name}, Oyo State</p>
                        )}
                      </div>
                    </div>
                  )}
                  {business.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-stone-700">Phone</p>
                        <a href={`tel:${business.phone}`} className="text-sm text-emerald-600 hover:underline">
                          {business.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-stone-700">Website</p>
                        <a 
                          href={business.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-emerald-600 hover:underline"
                        >
                          {business.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card data-testid="reviews-section">
              <CardHeader>
                <CardTitle>Reviews ({reviews.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Review Form */}
                {user && (
                  <form onSubmit={submitReview} className="mb-6 p-4 bg-stone-50 rounded-lg" data-testid="review-form">
                    <Label className="mb-2 block">Your Rating</Label>
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1"
                          data-testid={`rating-star-${star}`}
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= reviewRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-stone-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <Textarea
                      placeholder="Write your review..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="mb-4"
                      rows={3}
                      data-testid="review-textarea"
                    />
                    <Button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-emerald-800 hover:bg-emerald-700"
                      data-testid="submit-review-btn"
                    >
                      {submittingReview ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Submit Review
                    </Button>
                  </form>
                )}

                {!user && (
                  <div className="mb-6 p-4 bg-stone-50 rounded-lg text-center">
                    <p className="text-stone-600 mb-3">Sign in to leave a review</p>
                    <Link to="/login">
                      <Button variant="outline">Sign In</Button>
                    </Link>
                  </div>
                )}

                {/* Reviews List */}
                {reviews.length === 0 ? (
                  <p className="text-center text-stone-500 py-8">No reviews yet. Be the first to review!</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-stone-100 pb-4 last:border-0" data-testid={`review-${review.id}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-medium text-stone-900">{review.user?.full_name || 'Anonymous'}</p>
                              <div className="flex items-center gap-2">
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
                                <span className="text-xs text-stone-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-stone-600 ml-13 pl-13">{review.comment}</p>
                        
                        {/* Comments */}
                        {review.comments?.length > 0 && (
                          <div className="ml-13 pl-4 mt-3 border-l-2 border-stone-200 space-y-2">
                            {review.comments.map((comment) => (
                              <div key={comment.id} className="text-sm">
                                <span className="font-medium text-stone-700">{comment.user?.full_name}: </span>
                                <span className="text-stone-600">{comment.comment}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card data-testid="contact-card">
              <CardHeader>
                <CardTitle className="text-lg">Contact Business</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {business.phone && (
                  <>
                    <a href={`tel:${business.phone}`} className="block">
                      <Button className="w-full bg-emerald-800 hover:bg-emerald-700" data-testid="call-btn">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Now
                      </Button>
                    </a>
                    <a href={getWhatsAppLink(business.phone)} target="_blank" rel="noopener noreferrer" className="block">
                      <Button className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white" data-testid="whatsapp-btn">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                    </a>
                  </>
                )}
                {business.website && (
                  <a href={business.website} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full" data-testid="website-btn">
                      <Globe className="w-4 h-4 mr-2" />
                      Visit Website
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-stone-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-stone-500">Category</span>
                    <span className="text-sm font-medium text-stone-700">{business.category?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-stone-500">City</span>
                    <span className="text-sm font-medium text-stone-700">{business.city?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-stone-500">Total Reviews</span>
                    <span className="text-sm font-medium text-stone-700">{reviews.length}</span>
                  </div>
                  {averageRating && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-500">Average Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium text-stone-700">{averageRating}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetail;
