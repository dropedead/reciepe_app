import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Memuat...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/welcome" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if not completed
  if (user && user.onboardingCompleted === false) {
    return <Navigate to="/onboarding" replace />;
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return (
      <div className="page-container">
        <div className="error-container">
          <h2>Akses Ditolak</h2>
          <p>Anda tidak memiliki akses untuk halaman ini.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
