
import React, { useEffect } from 'react';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import Services from '@/components/Services';
import FeaturedProduct from '@/components/FeaturedProduct';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import Products from './Products';

const Index: React.FC = () => {
  useEffect(() => {
    document.title = 'Funnee Kiddee | Premium Party Equipment Rental';
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Products />
        <Services />
        <FeaturedProduct />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
