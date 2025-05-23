
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  const { t } = useLanguage();
  const { scrollY } = useScroll();
  const { items } = useCart();
  
  // Create scroll-based animations
  const titleOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const titleY = useTransform(scrollY, [0, 300], [0, -50]);
  const imageScale = useTransform(scrollY, [0, 300], [1, 1.1]);
  const backgroundY = useTransform(scrollY, [0, 300], [0, 100]);

  const handleScrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background circles with parallax effect */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-funneepurple/10 blur-3xl"></div>
        <div className="absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-funneeblue/10 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-funneeorange/10 blur-3xl"></div>
      </motion.div>

      <div className="section-container flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Text content with scroll effects */}
        <motion.div 
          className="flex-1 text-center lg:text-left"
          style={{ opacity: titleOpacity, y: titleY }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link to="/products">
              <Button 
                size="lg" 
                className="bg-funneepurple hover:bg-funneepurple/90"
              >
                Ver Productos
              </Button>
            </Link>
          </div>

          {/* Cart items preview (if any) */}
          {items.length > 0 && (
            <motion.div 
              className="mt-8 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-lg font-semibold mb-2">En tu carrito:</h3>
              <div className="flex flex-wrap gap-2">
                {items.slice(0, 3).map(item => (
                  <div key={item.id} className="flex items-center gap-2 bg-white dark:bg-gray-700 p-2 rounded-md shadow">
                    <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded" />
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm text-gray-500">x{item.quantity}</span>
                  </div>
                ))}
                {items.length > 3 && (
                  <div className="bg-white dark:bg-gray-700 p-2 rounded-md shadow">
                    <span className="text-sm">+{items.length - 3} más...</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
        
        {/* Image with parallax effect */}
        <motion.div 
          className="flex-1 relative"
          style={{ scale: imageScale }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" 
              alt="Children having fun at a party" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            
            {/* Decoration elements with floating effect */}
            <motion.div 
              className="absolute top-6 left-6 w-20 h-20 bg-white/20 backdrop-blur-md rounded-lg shadow-lg flex items-center justify-center" 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <img alt="Bouncy house icon" className="w-10 h-10" src="/lovable-uploads/f3c8ffe0-9352-4f3e-9aa2-c476787af292.jpg" />
            </motion.div>
            
            <motion.div 
              className="absolute bottom-6 right-6 w-20 h-20 bg-white/20 backdrop-blur-md rounded-lg shadow-lg flex items-center justify-center" 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
            >
              <img src="https://cdn-icons-png.flaticon.com/512/3081/3081886.png" alt="Party popper icon" className="w-10 h-10" />
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      {/* Scroll down indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer"
        onClick={handleScrollToContent}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <motion.div 
          className="flex flex-col items-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <span className="text-sm font-medium mb-2">Scroll Down</span>
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
