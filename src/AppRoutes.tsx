
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { useInitializeStorage } from "@/hooks/useInitializeStorage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

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

  // Only log initialization status, no redirects
  console.log(
    initialized 
      ? `Storage initialized for route: ${location.pathname}` 
      : `Storage initialization pending for route: ${location.pathname}`
  );

  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/products" element={<Products />} />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/orders" 
          element={
            <ProtectedRoute requireAdmin>
              <OrderAdmin />
            </ProtectedRoute>
          } 
        />
        <Route path="/auth" element={<Auth />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
};

export default AppRoutes;
