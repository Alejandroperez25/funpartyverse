import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from './LanguageToggle';
import ShoppingCart from './ShoppingCart';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
const Navbar: React.FC = () => {
  const {
    t
  } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  const navItems = [{
    id: 'home',
    label: t('nav.home'),
    href: '#home'
  }, {
    id: 'services',
    label: t('nav.services'),
    href: '#services'
  }, {
    id: 'featured',
    label: t('nav.featured'),
    href: '#featured'
  }, {
    id: 'contact',
    label: t('nav.contact'),
    href: '#contact'
  }];
  return <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 font-bold text-2xl">
            <a href="/" className="flex items-center">
              <span className="text-funneepurple font-toybox text-5xl font-bold">Funnee</span>
              <span className="text-funneeorange font-toybox text-5xl my-0 py-0 mx-0 font-bold px-[16px]">Kiddee</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map(item => <a key={item.id} href={item.href} className="text-gray-600 hover:text-funneepurple transition-colors font-medium">
                {item.label}
              </a>)}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageToggle />
            <ShoppingCart />
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-4">
            <ShoppingCart />
            <LanguageToggle />
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="relative" aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 py-3 space-y-3 bg-white/95 backdrop-blur-md">
          {navItems.map(item => <a key={item.id} href={item.href} className="block py-2 text-gray-600 hover:text-funneepurple transition-colors font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              {item.label}
            </a>)}
        </div>
      </div>
    </header>;
};
export default Navbar;