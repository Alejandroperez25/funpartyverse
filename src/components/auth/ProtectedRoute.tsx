
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/Loading";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireAdmin = false 
}: ProtectedRouteProps) => {
  const { user, isAdmin, loading, adminChecked } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Only check once authentication loading is complete
    if (!loading) {
      const timer = setTimeout(() => {
        setIsChecking(false);
      }, 500); // Short delay to ensure admin status is checked
      
      return () => clearTimeout(timer);
    }
  }, [loading, isAdmin, adminChecked]);

  if (loading || isChecking) {
    return (
      <div className="flex-grow flex items-center justify-center h-screen">
        <Loading />
        <p className="ml-2">Verificando acceso...</p>
      </div>
    );
  }

  // If we need authentication and user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If we need admin privileges and user is not admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If all conditions passed, render children
  return <>{children}</>;
};

export default ProtectedRoute;
