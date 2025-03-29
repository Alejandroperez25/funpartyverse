
import React, { useEffect } from 'react';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import Services from '@/components/Services';
import FeaturedProduct from '@/components/FeaturedProduct';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Index: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = 'Funnee Kiddee | Premium Party Equipment Rental';
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow mt-16">
        <Hero />
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="container mx-auto px-4 py-16 text-center"
        >
          <h2 className="text-3xl font-bold mb-8">Nuestros Productos</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
            Descubre nuestra colección de equipos de entretenimiento premium para fiestas infantiles.
            Contamos con los mejores productos para hacer de tu evento un éxito.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/products')}
            className="bg-funneepurple hover:bg-funneepurple/90"
          >
            Ver Todos los Productos
          </Button>
        </motion.div>
        
        <Services />
        <FeaturedProduct />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
