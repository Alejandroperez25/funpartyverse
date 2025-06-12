import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ModeToggle } from '@/components/ui/mode-toggle';
import LanguageToggle from '@/components/LanguageToggle';
import ShoppingCart from '@/components/ShoppingCart';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu, X, Home, ShoppingBag, Package2, ScrollText } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';
const Navbar: React.FC = () => {
  const {
    user,
    isAdmin,
    signOut
  } = useAuth();
  const {
    t
  } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const handleLanguageChange = (lang: 'es' | 'en') => {
    // This will be handled by the LanguageToggle component internally
  };

  // Add scroll listener to create animation effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);
  const navItems = [{
    name: t('navbar.products'),
    path: '/products',
    icon: ShoppingBag
  }, ...(user ? [{
    name: t('navbar.orders'),
    path: '/orders',
    icon: Package2
  }] : []), ...(isAdmin ? [{
    name: t('navbar.admin'),
    path: '/admin',
    icon: ScrollText
  }, {
    name: t('navbar.orders'),
    path: '/admin/orders',
    icon: Package2
  }] : [])];
  const MobileMenu = () => <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80%]">
        <div className="flex flex-col h-full py-4">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
              <img src="/lovable-uploads/20296858-23a1-4d50-87e5-7867df71b727.png" alt="PlayZone Logo" className="h-8 w-auto" />
              <span className="text-lg font-bold text-funneepurple">PlayZone</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex flex-col space-y-4">
            {navItems.map(item => <Link key={item.path} to={item.path} className="flex items-center px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>
                <item.icon className="mr-2 h-5 w-5" />
                {item.name}
              </Link>)}
          </div>
          
          <div className="mt-auto flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <LanguageToggle />
              <ModeToggle />
            </div>
            
            {user ? <Button variant="outline" className="w-full justify-start" onClick={() => {
            signOut();
            setMobileMenuOpen(false);
          }}>
                <LogOut className="h-5 w-5 mr-2" />
                {t('auth.signOut')}
              </Button> : <Link to="/auth" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-5 w-5 mr-2" />
                  {t('auth.signIn')}
                </Button>
              </Link>}
          </div>
        </div>
      </SheetContent>
    </Sheet>;
  return <motion.nav className={`fixed top-0 left-0 right-0 z-50 border-b w-full transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-sm shadow-md' : 'bg-background'}`} initial={{
    y: -100
  }} animate={{
    y: 0
  }} transition={{
    duration: 0.5
  }}>
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <Link to="/">
          <motion.div className="flex items-center space-x-3" whileHover={{
          scale: 1.05
        }} transition={{
          type: "spring",
          stiffness: 300
        }}>
            <img src="/lovable-uploads/20296858-23a1-4d50-87e5-7867df71b727.png" alt="PlayZone Logo" className="h-10 w-auto object-cover" />
            <span className="text-2xl font-bold text-funneepurple"></span>
          </motion.div>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2 sm:gap-4">
          {navItems.map(item => <motion.div key={item.path} whileHover={{
          scale: 1.1
        }} whileTap={{
          scale: 0.95
        }}>
              <Link to={item.path} className="text-sm sm:text-base flex items-center px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            </motion.div>)}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <LanguageToggle />
          </div>
          
          <div className="hidden md:block">
            <ModeToggle />
          </div>
          
          <ShoppingCart />
          
          {user ? <div className="hidden md:block">
              <motion.div whileHover={{
            scale: 1.1
          }} whileTap={{
            scale: 0.95
          }}>
                <Button variant="ghost" size="icon" onClick={signOut} className="rounded-full h-10 w-10">
                  <LogOut className="h-5 w-5" />
                </Button>
              </motion.div>
            </div> : <div className="hidden md:block">
              <motion.div whileHover={{
            scale: 1.1
          }} whileTap={{
            scale: 0.95
          }}>
                <Link to="/auth">
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </div>}
          
          {/* Mobile Menu Trigger */}
          <MobileMenu />
        </div>
      </div>
    </motion.nav>;
};
export default Navbar;