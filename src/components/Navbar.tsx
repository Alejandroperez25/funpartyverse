
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ModeToggle } from '@/components/ui/mode-toggle';
import LanguageToggle from '@/components/LanguageToggle';
import ShoppingCart from '@/components/ShoppingCart';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar: React.FC = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { t, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const handleLanguageChange = (lang: 'es' | 'en') => {
    setLanguage(lang);
  };

  const MobileMenu = () => (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80%]">
        <div className="flex flex-col h-full py-4">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="text-2xl font-bold text-funneepurple" onClick={() => setMobileMenuOpen(false)}>
              Funnee Prints
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex flex-col space-y-4">
            <Link 
              to="/products" 
              className="px-2 py-2 hover:bg-gray-100 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('navbar.products')}
            </Link>
            
            {user && (
              <Link 
                to="/orders" 
                className="px-2 py-2 hover:bg-gray-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('navbar.orders')}
              </Link>
            )}
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className="px-2 py-2 hover:bg-gray-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('navbar.admin')}
              </Link>
            )}
          </div>
          
          <div className="mt-auto flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <LanguageToggle onLanguageChange={handleLanguageChange} />
              <ModeToggle />
            </div>
            
            {user ? (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut className="h-5 w-5 mr-2" />
                {t('auth.signOut')}
              </Button>
            ) : (
              <Link to="/auth" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                >
                  <User className="h-5 w-5 mr-2" />
                  {t('auth.signIn')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <nav className="border-b w-full bg-background">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-funneepurple">
          Funnee Prints
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2 sm:gap-4">
          <Link to="/products" className="text-sm sm:text-base hover:text-funneepurple">
            {t('navbar.products')}
          </Link>
          
          {user && (
            <Link to="/orders" className="text-sm sm:text-base hover:text-funneepurple">
              {t('navbar.orders')}
            </Link>
          )}
          
          {isAdmin && (
            <Link to="/admin" className="text-sm sm:text-base hover:text-funneepurple">
              {t('navbar.admin')}
            </Link>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <LanguageToggle onLanguageChange={handleLanguageChange} />
          </div>
          
          <div className="hidden md:block">
            <ModeToggle />
          </div>
          
          <ShoppingCart />
          
          {user ? (
            <div className="hidden md:block">
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="rounded-full h-10 w-10"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="hidden md:block">
              <Link to="/auth">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10"
                >
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
          
          {/* Mobile Menu Trigger */}
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
