import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ShoppingCart } from './ShoppingCart';
import { ModeToggle } from "@/components/ui/mode-toggle"
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { t, changeLanguage } = useLanguage();

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(event.target.value);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow">
      <div className="section-container">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center text-2xl font-semibold text-funneepurple dark:text-white">
            Funnee Kiddee
          </Link>
          <div className="flex items-center space-x-6">
            <Link to="/products" className="hidden md:block text-gray-600 dark:text-gray-300 hover:text-funneepurple dark:hover:text-funneeblue transition-colors">
              {t('navbar.products')}
            </Link>
            <select
              className="block appearance-none w-full bg-gray-50 border border-gray-200 text-gray-500 py-2 px-4 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              onChange={handleLanguageChange}
              defaultValue={localStorage.getItem('language') || 'en'}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
            <ShoppingCart />
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
