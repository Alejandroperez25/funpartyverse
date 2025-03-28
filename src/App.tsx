
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import CheckoutSuccess from "./pages/CheckoutSuccess";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <LanguageProvider>
            <CartProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/checkout/success" element={<CheckoutSuccess />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </CartProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
