import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { 
  Search as SearchIcon, 
  MapPin, 
  Building2, 
  Filter,
  X,
  Loader2,
  CheckCircle
} from 'lucide-react';

const isActivelyFeatured = (biz) =>
  Boolean(biz?.is_featured && biz?.featured_until && new Date(biz.featured_until) > new Date());

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchFilters = async () => {
      try {
        const [{ data: categoriesData }, { data: citiesData }] = await Promise.all([
          supabase.from('categories').select('*').order('name'),
          supabase.from('cities').select('*').order('name')
        ]);
        if (isMounted) {
          setCategories(categoriesData || []);
          setCities(citiesData || []);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.log('Filters fetch note:', err.message);
        }
      }
    };
    
    fetchFilters();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const searchBusinesses = async () => {
      setLoading(true);
      try {
        let queryBuilder = supabase
          .from('businesses')
          .select(`
            *,
            category:categories(name),
            city:cities(name),
            photos:business_photos(photo_url)
          `)
          .eq('status', 'approved');

        const q = searchParams.get('q');
        const category = searchParams.get('category');
        const city = searchParams.get('city');

        if (q) {
          queryBuilder = queryBuilder.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
        }
        if (category && category !== 'all') {
          queryBuilder = queryBuilder.eq('category_id', category);
        }
        if (city && city !== 'all') {
          queryBuilder = queryBuilder.eq('city_id', city);
        }

        const { data, error } = await queryBuilder.order('created_at', { ascending: false });
        
        if (!isMounted) return;
        if (error) throw error;

        const sorted = [...(data || [])].sort((a, b) => {
          const aFeatured = isActivelyFeatured(a);
          const bFeatured = isActivelyFeatured(b);
          if (aFeatured && !bFeatured) return -1;
          if (!aFeatured && bFeatured) return 1;
          return 0; // keep existing created_at ordering within each group
        });

        setBusinesses(sorted);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.log('Search note:', error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    searchBusinesses();
    return () => { isMounted = false; };
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedCity && selectedCity !== 'all') params.set('city', selectedCity);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedCategory('');
    setSelectedCity('');
    setSearchParams({});
  };

  const hasActiveFilters = query || selectedCategory || selectedCity;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Search Header */}
      <div className="bg-white border-b border-stone-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} data-testid="search-form">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <Input
                  type="text"
                  placeholder="Search businesses..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 h-11"
                  data-testid="search-query-input"
                />
              </div>

              <div className="hidden md:flex gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px] h-11" data-testid="filter-category">
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
                  <SelectTrigger className="w-[180px] h-11" data-testid="filter-city">
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
                type="button" 
                variant="outline" 
                className="md:hidden h-11"
                onClick={() => setShowFilters(!showFilters)}
                data-testid="toggle-filters"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>

              <Button type="submit" className="h-11 bg-emerald-800 hover:bg-emerald-700" data-testid="search-btn">
                <SearchIcon className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Search</span>
              </Button>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="md:hidden mt-3 pt-3 border-t border-stone-200 flex gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="flex-1 h-11" data-testid="mobile-filter-category">
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
                  <SelectTrigger className="flex-1 h-11" data-testid="mobile-filter-city">
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
            )}
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-900" data-testid="results-count">
              {loading ? 'Searching...' : `${businesses.length} Business${businesses.length !== 1 ? 'es' : ''} Found`}
            </h1>
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {query && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {query}
                  </Badge>
                )}
                {selectedCategory && selectedCategory !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {categories.find(c => c.id === selectedCategory)?.name}
                  </Badge>
                )}
                {selectedCity && selectedCity !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {cities.find(c => c.id === selectedCity)?.name}
                  </Badge>
                )}
              </div>
            )}
          </div>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-stone-500"
              data-testid="clear-filters"
            >
              <X className="w-4 h-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        )}

        {/* Empty State */}
        {!loading && businesses.length === 0 && (
          <div className="text-center py-20" data-testid="no-results">
            <Building2 className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-stone-900 mb-2">No businesses found</h2>
            <p className="text-stone-500 mb-6">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear all filters
            </Button>
          </div>
        )}

        {/* Results Grid */}
        {!loading && businesses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="search-results">
            {businesses.map((business) => (
              <Link
                key={business.id}
                to={`/business/${business.id}`}
                className="group"
                data-testid={`result-${business.id}`}
              >
                <Card className={`h-full overflow-hidden bg-white hover:shadow-lg transition-all duration-300 ${isActivelyFeatured(business) ? 'ring-2 ring-amber-400' : ''}`}>
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
                    {isActivelyFeatured(business) && (
                      <Badge className="absolute top-3 right-3 bg-amber-500 text-white">
                        Sponsored
                      </Badge>
                    )}
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
        )}
      </div>
    </div>
  );
};

export default Search;
