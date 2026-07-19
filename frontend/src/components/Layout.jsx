import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Store, 
  Shield,
  ChevronDown,
  Search,
  Plus
} from 'lucide-react';
import { useState } from 'react';

export const Layout = ({ children }) => {
  const { user, profile, signOut, isAdmin, isOwner } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const getRoleBadge = () => {
    if (profile?.role === 'admin') {
      return <Badge className="bg-purple-100 text-purple-700 text-xs">Admin</Badge>;
    } else if (profile?.role === 'owner') {
      return <Badge className="bg-blue-100 text-blue-700 text-xs">Business Owner</Badge>;
    }
    return <Badge className="bg-stone-100 text-stone-700 text-xs">User</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
              <div className="w-10 h-10 bg-emerald-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">OB</span>
              </div>
              <span className="font-semibold text-xl text-stone-900 hidden sm:block">
                Oyo Biz
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link 
                to="/search" 
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  isActive('/search') ? 'text-emerald-700' : 'text-stone-600 hover:text-stone-900'
                }`}
                data-testid="nav-search"
              >
                <Search className="w-4 h-4" />
                Search
              </Link>

              {/* List Business - visible to everyone, but owners go to dashboard */}
              {user && isOwner ? (
                <Link 
                  to="/owner" 
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    isActive('/owner') ? 'text-emerald-700' : 'text-stone-600 hover:text-stone-900'
                  }`}
                  data-testid="nav-list-business"
                >
                  <Store className="w-4 h-4" />
                  My Businesses
                </Link>
              ) : (
                <Link 
                  to={user ? "/owner" : "/signup"} 
                  className="flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                  data-testid="nav-list-business"
                >
                  <Plus className="w-4 h-4" />
                  List Business
                </Link>
              )}

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-2"
                      data-testid="user-menu-trigger"
                    >
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-emerald-700" />
                      </div>
                      <span className="text-sm font-medium text-stone-700">
                        {profile?.full_name || 'User'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-stone-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {/* Account Type Label */}
                    <DropdownMenuLabel className="flex items-center justify-between">
                      <span className="text-xs text-stone-500">Account Type</span>
                      {getRoleBadge()}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2" data-testid="menu-dashboard">
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    
                    {isOwner && (
                      <DropdownMenuItem asChild>
                        <Link to="/owner" className="flex items-center gap-2" data-testid="menu-owner">
                          <Store className="w-4 h-4" />
                          Business Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2" data-testid="menu-admin">
                          <Shield className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="text-red-600 focus:text-red-600"
                      data-testid="menu-signout"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login">
                    <Button variant="ghost" data-testid="nav-login">Log In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button 
                      className="bg-emerald-800 hover:bg-emerald-700 text-white rounded-full"
                      data-testid="nav-signup"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-stone-700" />
              ) : (
                <Menu className="w-6 h-6 text-stone-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              <Link 
                to="/search" 
                className="flex items-center gap-2 py-2 text-stone-600"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-nav-search"
              >
                <Search className="w-5 h-5" />
                Search Businesses
              </Link>

              {user && isOwner ? (
                <Link 
                  to="/owner" 
                  className="flex items-center gap-2 py-2 text-stone-600"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-nav-businesses"
                >
                  <Store className="w-5 h-5" />
                  My Businesses
                </Link>
              ) : (
                <Link 
                  to={user ? "/owner" : "/signup"} 
                  className="flex items-center gap-2 py-2 text-stone-600"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-nav-list"
                >
                  <Plus className="w-5 h-5" />
                  List Business
                </Link>
              )}
              
              {user ? (
                <>
                  {/* Show account type */}
                  <div className="flex items-center gap-2 py-2">
                    <span className="text-sm text-stone-500">Account:</span>
                    {getRoleBadge()}
                  </div>
                  
                  <Link 
                    to="/dashboard" 
                    className="flex items-center gap-2 py-2 text-stone-600"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-nav-dashboard"
                  >
                    <User className="w-5 h-5" />
                    My Profile
                  </Link>
                  
                  {isOwner && (
                    <Link 
                      to="/owner" 
                      className="flex items-center gap-2 py-2 text-stone-600"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-nav-owner"
                    >
                      <Store className="w-5 h-5" />
                      Business Dashboard
                    </Link>
                  )}
                  
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="flex items-center gap-2 py-2 text-stone-600"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-nav-admin"
                    >
                      <Shield className="w-5 h-5" />
                      Admin Panel
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 py-2 text-red-600 w-full"
                    data-testid="mobile-nav-signout"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full" data-testid="mobile-nav-login">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-emerald-800 hover:bg-emerald-700" data-testid="mobile-nav-signup">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-emerald-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">OB</span>
                </div>
                <span className="font-semibold text-xl">Oyo Biz</span>
              </div>
              <p className="text-emerald-200 text-sm max-w-md">
                Discover and connect with amazing businesses across Oyo State, Nigeria. 
                From local shops to professional services, find everything you need.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-emerald-200">
                <li><Link to="/search" className="hover:text-white transition-colors">Search Businesses</Link></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">Create Account</Link></li>
                <li><Link to="/owner" className="hover:text-white transition-colors">List Your Business</Link></li>
                <li><Link to="/contact-admin" className="hover:text-white transition-colors flex items-center gap-1">Contact Admin</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Cities</h4>
              <ul className="space-y-2 text-sm text-emerald-200">
                <li>Ibadan</li>
                <li>Ogbomoso</li>
                <li>Oyo</li>
                <li>Iseyin</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-emerald-800 mt-8 pt-8 text-center text-sm text-emerald-300">
            <p>&copy; {new Date().getFullYear()} Oyo Biz. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
