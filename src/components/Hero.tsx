
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-funneepurple/10 blur-3xl"></div>
        <div className="absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-funneeblue/10 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-funneeorange/10 blur-3xl"></div>
      </div>

      <div className="section-container flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Text content */}
        <motion.div 
          className="flex-1 text-center lg:text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="inline-block px-3 py-1 mb-4 text-sm font-medium bg-funneepurple/10 text-funneepurple rounded-full">
            Funnee Kiddee Party Services
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button className="bg-funneepurple hover:bg-funneepurple/90 text-white px-8 py-6 text-lg">
              {t('hero.cta')}
            </Button>
            <Button variant="outline" className="border-funneepurple text-funneepurple hover:bg-funneepurple/10 px-8 py-6 text-lg">
              {t('nav.contact')}
            </Button>
          </div>
        </motion.div>
        
        {/* Image */}
        <motion.div 
          className="flex-1 relative"
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
            
            {/* Decoration elements */}
            <motion.div 
              className="absolute top-6 left-6 w-20 h-20 bg-white/20 backdrop-blur-md rounded-lg shadow-lg flex items-center justify-center"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <img src="https://cdn-icons-png.flaticon.com/512/6955/6955003.png" alt="Bouncy house icon" className="w-10 h-10" />
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
    </section>
  );
};

export default Hero;
