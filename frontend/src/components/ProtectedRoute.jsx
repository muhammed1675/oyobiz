import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If profile doesn't exist yet (tables not set up), allow access to owner dashboard
  // but not admin (admin requires explicit role)
  if (requiredRole) {
    if (requiredRole === 'admin') {
      if (profile?.role !== 'admin') {
        return <Navigate to="/" replace />;
      }
    } else if (requiredRole === 'owner') {
      // Allow if profile is owner/admin OR if profile is null (tables not set up)
      const hasAccess = !profile || ['admin', 'owner'].includes(profile?.role);
      if (!hasAccess) {
        return <Navigate to="/" replace />;
      }
    }
  }

  return children;
};
