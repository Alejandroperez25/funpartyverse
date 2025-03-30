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

  // Keep track of initialization but don't auto-redirect
  useEffect(() => {
    if (initialized) {
      console.log('Storage initialization complete for route:', location.pathname);
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
