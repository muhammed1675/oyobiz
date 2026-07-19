import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Search, 
  MapPin, 
  Star, 
  ArrowRight,
  Building2,
  Users,
  TrendingUp,
  CheckCircle,
  UtensilsCrossed,
  Hotel,
  Cross,
  GraduationCap,
  ShoppingBag,
  Settings,
  Car,
  Drama
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [featuredBusinesses, setFeaturedBusinesses] = useState([]);
  const [stats, setStats] = useState({ businesses: 0, categories: 0, cities: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        if (!isMounted) return;
        setCategories(categoriesData || []);

        // Fetch cities
        const { data: citiesData } = await supabase
          .from('cities')
          .select('*')
          .order('name');
        if (!isMounted) return;
        setCities(citiesData || []);

        // Fetch featured businesses (approved only)
        const { data: businessesData } = await supabase
          .from('businesses')
          .select(`
            *,
            category:categories(name),
            city:cities(name),
            photos:business_photos(photo_url)
          `)
          .eq('status', 'approved')
          .limit(6);
        if (!isMounted) return;
        setFeaturedBusinesses(businessesData || []);

        // Get stats
        const { count: businessCount } = await supabase
          .from('businesses')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved');
        
        if (!isMounted) return;
        setStats({
          businesses: businessCount || 0,
          categories: categoriesData?.length || 0,
          cities: citiesData?.length || 0
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.log('Data fetch note:', error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedCity) params.set('city', selectedCity);
    navigate(`/search?${params.toString()}`);
  };

  const categoryIcons = {
    'Restaurants': UtensilsCrossed,
    'Hotels': Hotel,
    'Healthcare': Cross,
    'Education': GraduationCap,
    'Shopping': ShoppingBag,
    'Services': Settings,
    'Transportation': Car,
    'Entertainment': Drama,
    'default': Building2
  };

  const getCategoryIcon = (categoryName) => {
    const IconComponent = categoryIcons[categoryName] || categoryIcons['default'];
    return <IconComponent className="w-8 h-8 text-emerald-600" />;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1646459273756-1337637ea7ce?crop=entropy&cs=srgb&fm=jpg&q=85')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <Badge className="bg-lime-500/20 text-lime-300 border-lime-500/30 mb-6">
              Oyo State Business Directory
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
              Discover Amazing
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-lime-400 to-emerald-300">
                Local Businesses
              </span>
            </h1>
            <p className="text-lg md:text-xl text-emerald-100 mb-8 max-w-2xl">
              Connect with trusted businesses across Oyo State. From restaurants to services, 
              find everything you need in one place.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6" data-testid="hero-search-form">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Input
                    type="text"
                    placeholder="Search businesses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 bg-white border-0 text-stone-900 placeholder:text-stone-400"
                    data-testid="search-input"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-12 bg-white border-0 text-stone-900" data-testid="category-select">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="h-12 bg-white border-0 text-stone-900" data-testid="city-select">
                    <SelectValue placeholder="City" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit" 
                className="w-full md:w-auto mt-4 h-12 px-8 bg-lime-500 hover:bg-lime-400 text-emerald-900 font-semibold rounded-full"
                data-testid="search-submit"
              >
                <Search className="w-5 h-5 mr-2" />
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center" data-testid="stat-businesses">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl mb-3">
                <Building2 className="w-6 h-6 text-emerald-700" />
              </div>
              <div className="text-3xl font-bold text-stone-900">{stats.businesses}+</div>
              <div className="text-sm text-stone-500">Businesses</div>
            </div>
            <div className="text-center" data-testid="stat-categories">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl mb-3">
                <TrendingUp className="w-6 h-6 text-orange-700" />
              </div>
              <div className="text-3xl font-bold text-stone-900">{stats.categories}</div>
              <div className="text-sm text-stone-500">Categories</div>
            </div>
            <div className="text-center" data-testid="stat-cities">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-lime-100 rounded-xl mb-3">
                <Users className="w-6 h-6 text-lime-700" />
              </div>
              <div className="text-3xl font-bold text-stone-900">{stats.cities}</div>
              <div className="text-sm text-stone-500">Cities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-stone-500 max-w-2xl mx-auto">
              Explore businesses across different categories in Oyo State
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="categories-grid">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                to={`/search?category=${category.id}`}
                className="group"
                data-testid={`category-${category.id}`}
              >
                <Card className="h-full bg-stone-50 hover:bg-emerald-50/50 border border-transparent hover:border-emerald-200 transition-all duration-300">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="mb-3">
                      {getCategoryIcon(category.name)}
                    </div>
                    <h3 className="font-semibold text-stone-800 group-hover:text-emerald-700 transition-colors">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {categories.length > 8 && (
            <div className="text-center mt-8">
              <Link to="/search">
                <Button variant="outline" className="rounded-full" data-testid="view-all-categories">
                  View All Categories
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Businesses */}
      {featuredBusinesses.length > 0 && (
        <section className="py-16 md:py-24 bg-stone-100/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2">
                  Featured Businesses
                </h2>
                <p className="text-stone-500">
                  Top-rated businesses in Oyo State
                </p>
              </div>
              <Link to="/search" className="mt-4 md:mt-0">
                <Button variant="outline" className="rounded-full" data-testid="view-all-businesses">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="featured-businesses">
              {featuredBusinesses.map((business) => (
                <Link
                  key={business.id}
                  to={`/business/${business.id}`}
                  className="group"
                  data-testid={`business-card-${business.id}`}
                >
                  <Card className="h-full overflow-hidden bg-white hover:shadow-lg transition-all duration-300">
                    <div className="aspect-video relative overflow-hidden bg-stone-200">
                      {business.photos?.[0]?.photo_url ? (
                        <img
                          src={business.photos[0].photo_url}
                          alt={business.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-emerald-100">
                          <Building2 className="w-12 h-12 text-emerald-300" />
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3 bg-emerald-600 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-lg text-stone-900 mb-2 group-hover:text-emerald-700 transition-colors">
                        {business.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-stone-500 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>{business.city?.name || 'Oyo State'}</span>
                        {business.category && (
                          <>
                            <span className="text-stone-300">•</span>
                            <span>{business.category.name}</span>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-stone-600 line-clamp-2">
                        {business.description || 'No description available'}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-3xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Own a Business in Oyo State?
            </h2>
            <p className="text-emerald-200 max-w-2xl mx-auto mb-8">
              List your business on Oyo Biz and reach thousands of potential customers. 
              It's free to get started!
            </p>
            <Link to="/signup">
              <Button 
                size="lg" 
                className="bg-lime-500 hover:bg-lime-400 text-emerald-900 font-semibold rounded-full px-8"
                data-testid="cta-list-business"
              >
                List Your Business
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
