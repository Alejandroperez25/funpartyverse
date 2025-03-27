
import React, { useEffect } from 'react';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import Services from '@/components/Services';
import FeaturedProduct from '@/components/FeaturedProduct';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';

const Index: React.FC = () => {
  useEffect(() => {
    document.title = 'Funnee Kiddee | Premium Party Equipment Rental';
  }, []);

  return (
    <LanguageProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Hero />
            <Services />
            <FeaturedProduct />
            <ContactSection />
          </main>
          <Footer />
        </div>
      </CartProvider>
    </LanguageProvider>
  );
};

export default Index;
