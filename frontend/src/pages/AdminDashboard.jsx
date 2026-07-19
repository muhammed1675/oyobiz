import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import {
  Shield,
  Store,
  Users,
  FolderTree,
  MapPin,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Star
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    pendingBusinesses: 0,
    totalUsers: 0,
    totalCategories: 0,
    totalCities: 0
  });

  // Form states
  const [newCategory, setNewCategory] = useState('');
  const [newCity, setNewCity] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingCity, setSavingCity] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch businesses with related data
      const { data: businessesData } = await supabase
        .from('businesses')
        .select(`
          *,
          category:categories(name),
          city:cities(name),
          owner:users!businesses_owner_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });
      setBusinesses(businessesData || []);

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      setCategories(categoriesData || []);

      // Fetch cities
      const { data: citiesData } = await supabase
        .from('cities')
        .select('*')
        .order('name');
      setCities(citiesData || []);

      // Fetch users
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      setUsers(usersData || []);

      // Set stats
      setStats({
        totalBusinesses: businessesData?.length || 0,
        pendingBusinesses: businessesData?.filter(b => b.status === 'pending').length || 0,
        totalUsers: usersData?.length || 0,
        totalCategories: categoriesData?.length || 0,
        totalCities: citiesData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessStatus = async (businessId, status) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ status, approved: status === 'approved' })
        .eq('id', businessId);

      if (error) throw error;
      toast.success(`Business ${status}`);
      fetchAllData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const isActivelyFeatured = (business) =>
    Boolean(business.is_featured && business.featured_until && new Date(business.featured_until) > new Date());

  const setFeatured = async (businessId, days) => {
    try {
      const featuredUntil = new Date();
      featuredUntil.setDate(featuredUntil.getDate() + days);

      const { error } = await supabase
        .from('businesses')
        .update({ is_featured: true, featured_until: featuredUntil.toISOString() })
        .eq('id', businessId);

      if (error) throw error;
      toast.success(`Featured for ${days} days`);
      fetchAllData();
    } catch (error) {
      toast.error('Failed to feature business');
    }
  };

  const unfeature = async (businessId) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ is_featured: false, featured_until: null })
        .eq('id', businessId);

      if (error) throw error;
      toast.success('Removed from featured');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to update business');
    }
  };

  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setSavingCategory(true);
    try {
      const { error } = await supabase
        .from('categories')
        .insert({ name: newCategory.trim() });

      if (error) throw error;
      toast.success('Category added');
      setNewCategory('');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to add category');
    } finally {
      setSavingCategory(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!confirm('Are you sure? Businesses in this category will be affected.')) return;

    try {
      await supabase.from('categories').delete().eq('id', categoryId);
      toast.success('Category deleted');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const addCity = async (e) => {
    e.preventDefault();
    if (!newCity.trim()) return;

    setSavingCity(true);
    try {
      const { error } = await supabase
        .from('cities')
        .insert({ name: newCity.trim() });

      if (error) throw error;
      toast.success('City added');
      setNewCity('');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to add city');
    } finally {
      setSavingCity(false);
    }
  };

  const deleteCity = async (cityId) => {
    if (!confirm('Are you sure? Businesses in this city will be affected.')) return;

    try {
      await supabase.from('cities').delete().eq('id', cityId);
      toast.success('City deleted');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete city');
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)
        .select();

      if (error) {
        console.error('Role update error:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('No rows updated - check RLS policies');
      }
      
      toast.success(`User role updated to ${newRole}`);
      fetchAllData();
    } catch (error) {
      console.error('Failed to update role:', error);
      toast.error(`Failed to update role: ${error.message || 'Check RLS policies in Supabase'}`);
    }
  };

  const deleteUser = async (userId, userEmail) => {
    if (!confirm(`Are you sure you want to delete the user "${userEmail}"? This will also delete all their businesses, reviews, and favorites. This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete user's businesses first (cascade will handle related data)
      await supabase.from('businesses').delete().eq('owner_id', userId);
      
      // Delete user's reviews
      await supabase.from('reviews').delete().eq('user_id', userId);
      
      // Delete user's favorites
      await supabase.from('favorites').delete().eq('user_id', userId);
      
      // Delete user's comments
      await supabase.from('comments').delete().eq('user_id', userId);
      
      // Finally delete the user profile
      const { error } = await supabase.from('users').delete().eq('id', userId);

      if (error) throw error;
      
      toast.success('User deleted successfully');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user. Make sure all related data is removed.');
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

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-700">Admin</Badge>;
      case 'owner':
        return <Badge className="bg-blue-100 text-blue-700">Owner</Badge>;
      default:
        return <Badge className="bg-stone-100 text-stone-700">User</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50" data-testid="admin-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-emerald-600" />
            Admin Dashboard
          </h1>
          <p className="text-stone-500">Manage businesses, categories, cities, and users</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Store className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-stone-900">{stats.totalBusinesses}</p>
                <p className="text-xs text-stone-500">Total Businesses</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-stone-900">{stats.pendingBusinesses}</p>
                <p className="text-xs text-stone-500">Pending Approval</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-stone-900">{stats.totalUsers}</p>
                <p className="text-xs text-stone-500">Users</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <FolderTree className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-stone-900">{stats.totalCategories}</p>
                <p className="text-xs text-stone-500">Categories</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-rose-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-stone-900">{stats.totalCities}</p>
                <p className="text-xs text-stone-500">Cities</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="businesses" className="space-y-6">
          <TabsList className="bg-white border border-stone-200">
            <TabsTrigger value="businesses" data-testid="tab-businesses">
              <Store className="w-4 h-4 mr-2" />
              Businesses
            </TabsTrigger>
            <TabsTrigger value="categories" data-testid="tab-categories">
              <FolderTree className="w-4 h-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="cities" data-testid="tab-cities">
              <MapPin className="w-4 h-4 mr-2" />
              Cities
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
          </TabsList>

          {/* Businesses Tab */}
          <TabsContent value="businesses">
            <Card>
              <CardHeader>
                <CardTitle>Business Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table data-testid="businesses-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>CAC Number</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {businesses.map((business) => (
                        <TableRow key={business.id} data-testid={`business-row-${business.id}`}>
                          <TableCell className="font-medium">{business.name}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{business.owner?.full_name}</p>
                              <p className="text-xs text-stone-500">{business.owner?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              {business.cac_number || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>{business.category?.name}</TableCell>
                          <TableCell>{business.city?.name}</TableCell>
                          <TableCell>{getStatusBadge(business.status)}</TableCell>
                          <TableCell>
                            {isActivelyFeatured(business) ? (
                              <div className="flex flex-col gap-1">
                                <Badge className="bg-amber-100 text-amber-700 w-fit">
                                  <Star className="w-3 h-3 mr-1 fill-amber-700" />
                                  Featured
                                </Badge>
                                <span className="text-xs text-stone-400">
                                  until {new Date(business.featured_until).toLocaleDateString()}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => unfeature(business.id)}
                                >
                                  Remove
                                </Button>
                              </div>
                            ) : (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => setFeatured(business.id, 7)}
                                  data-testid={`feature-7d-${business.id}`}
                                >
                                  7d
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => setFeatured(business.id, 30)}
                                  data-testid={`feature-30d-${business.id}`}
                                >
                                  30d
                                </Button>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {business.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() => updateBusinessStatus(business.id, 'approved')}
                                    data-testid={`approve-${business.id}`}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => updateBusinessStatus(business.id, 'rejected')}
                                    data-testid={`reject-${business.id}`}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {business.status === 'rejected' && (
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                  onClick={() => updateBusinessStatus(business.id, 'approved')}
                                  data-testid={`approve-${business.id}`}
                                >
                                  Approve
                                </Button>
                              )}
                              {business.status === 'approved' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateBusinessStatus(business.id, 'pending')}
                                >
                                  Unpublish
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={addCategory} className="flex gap-3 mb-6" data-testid="add-category-form">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name"
                    className="max-w-xs"
                    data-testid="category-name-input"
                  />
                  <Button type="submit" disabled={savingCategory} className="bg-emerald-800 hover:bg-emerald-700" data-testid="add-category-btn">
                    {savingCategory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                    Add
                  </Button>
                </form>
                <div className="flex flex-wrap gap-2" data-testid="categories-list">
                  {categories.map((category) => (
                    <Badge 
                      key={category.id} 
                      variant="secondary" 
                      className="flex items-center gap-2 py-2 px-3"
                      data-testid={`category-${category.id}`}
                    >
                      {category.name}
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="text-stone-400 hover:text-red-500"
                        data-testid={`delete-category-${category.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cities Tab */}
          <TabsContent value="cities">
            <Card>
              <CardHeader>
                <CardTitle>Cities in Oyo State</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={addCity} className="flex gap-3 mb-6" data-testid="add-city-form">
                  <Input
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="New city name"
                    className="max-w-xs"
                    data-testid="city-name-input"
                  />
                  <Button type="submit" disabled={savingCity} className="bg-emerald-800 hover:bg-emerald-700" data-testid="add-city-btn">
                    {savingCity ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                    Add
                  </Button>
                </form>
                <div className="flex flex-wrap gap-2" data-testid="cities-list">
                  {cities.map((city) => (
                    <Badge 
                      key={city.id} 
                      variant="secondary" 
                      className="flex items-center gap-2 py-2 px-3"
                      data-testid={`city-${city.id}`}
                    >
                      <MapPin className="w-3 h-3" />
                      {city.name}
                      <button
                        onClick={() => deleteCity(city.id)}
                        className="text-stone-400 hover:text-red-500"
                        data-testid={`delete-city-${city.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table data-testid="users-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Change Role</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id} data-testid={`user-row-${u.id}`}>
                          <TableCell className="font-medium">{u.full_name || 'N/A'}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>{getRoleBadge(u.role)}</TableCell>
                          <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Select
                              value={u.role}
                              onValueChange={(value) => updateUserRole(u.id, value)}
                              disabled={u.id === user.id}
                            >
                              <SelectTrigger className="w-[120px]" data-testid={`role-select-${u.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="owner">Owner</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteUser(u.id, u.email)}
                              disabled={u.id === user.id}
                              data-testid={`delete-user-${u.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
