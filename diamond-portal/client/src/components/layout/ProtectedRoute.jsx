import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream">
      <div className="animate-spin w-8 h-8 border-4 border-brand-teal border-t-transparent rounded-full" />
    </div>
  );
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}
