
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { useEffect } from "react";
import { useInitializeStorage } from "@/hooks/useInitializeStorage";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Admin from "./pages/Admin";
import OrderAdmin from "./pages/OrderAdmin";
import Auth from "./pages/Auth";
import CheckoutSuccess from "./pages/CheckoutSuccess";

const AppRoutes = () => {
  const { initialized } = useInitializeStorage();
  const location = useLocation();
  const navigate = useNavigate();

  // Force renavigation to current route when storage is initialized
  // to ensure components render with correct storage permissions
  useEffect(() => {
    if (initialized) {
      const isAdminRoute = location.pathname.includes('/admin');
      
      if (isAdminRoute) {
        // For admin routes, refresh after storage is initialized
        // This ensures the admin validation checks run with proper session
        console.log('Storage initialized. Refreshing admin route:', location.pathname);
        setTimeout(() => {
          navigate(0); // Refresh the current page
        }, 100); 
      } else {
        console.log('Storage initialized for non-admin route:', location.pathname);
      }
    }
  }, [initialized, location.pathname]);

  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/products" element={<Products />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/orders" element={<OrderAdmin />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
};

export default AppRoutes;
