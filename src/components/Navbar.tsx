
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ModeToggle } from '@/components/ui/mode-toggle';
import LanguageToggle from '@/components/LanguageToggle';
import ShoppingCart from '@/components/ShoppingCart';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { t, setLanguage } = useLanguage();
  
  const handleLanguageChange = (lang: 'es' | 'en') => {
    setLanguage(lang);
  };

  return (
    <nav className="border-b w-full bg-background">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-funneepurple">
          Funnee Prints
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4">
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
          <LanguageToggle 
            onLanguageChange={handleLanguageChange} 
          />
          
          <ModeToggle />
          
          {user ? (
            <div className="flex items-center gap-2">
              <ShoppingCart />
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
            <div className="flex items-center gap-2">
              <ShoppingCart />
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
