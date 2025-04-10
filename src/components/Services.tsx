
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import ServiceCard from './ServiceCard';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Tent, Popcorn, Candy, UtensilsCrossed, LampFloor, Table } from 'lucide-react';

const Services: React.FC = () => {
  const { t } = useLanguage();
  const { scrollY } = useScroll();
  
  // Create staggered card entrance effect
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const titleOpacity = useTransform(scrollY, [300, 500], [0, 1]);
  const titleY = useTransform(scrollY, [300, 500], [50, 0]);

  const services = [
    {
      id: 'bounce-house',
      name: 'Bounce House',
      description: 'Colorful and safe bounce houses for endless fun and entertainment.',
      price: 149.99,
      image: '/lovable-uploads/54e27d4e-b8ae-4061-9a1b-3b3b83a19f7c.png',
      icon: <Tent className="h-5 w-5 text-funneepurple" />
    },
    {
      id: 'popcorn-machine',
      name: 'Popcorn Machine',
      description: 'Fresh, buttery popcorn for your guests to enjoy during the celebration.',
      price: 79.99,
      image: '/lovable-uploads/abe42246-299b-47ae-a0be-0f2bf7527f21.png',
      icon: <Popcorn className="h-5 w-5 text-funneepurple" />
    },
    {
      id: 'cotton-candy',
      name: 'Cotton Candy Machine',
      description: 'Sweet, fluffy cotton candy to delight party guests of all ages.',
      price: 89.99,
      image: '/lovable-uploads/ac008183-5868-4d36-9000-5adbb19300e2.png',
      icon: <Candy className="h-5 w-5 text-funneepurple" />
    },
    {
      id: 'hot-dog-machine',
      name: 'Hot Dog Machine',
      description: 'Delicious hot dogs cooked to perfection for a savory party treat.',
      price: 99.99,
      image: '/lovable-uploads/1498fe57-0184-4abe-b1ee-08b4d8d2ab88.png',
      icon: <UtensilsCrossed className="h-5 w-5 text-funneepurple" />
    },
    {
      id: 'water-slide',
      name: 'Water Slide',
      description: 'Exciting water slide perfect for summer parties and outdoor events.',
      price: 199.99,
      image: '/lovable-uploads/80ece112-6025-4d01-a563-c537799d31c0.png',
      icon: <LampFloor className="h-5 w-5 text-funneepurple" />
    },
    {
      id: 'tables',
      name: 'Party Tables',
      description: 'Sturdy tables perfect for food, gifts, or activities at your celebration.',
      price: 8.99,
      image: 'https://images.unsplash.com/photo-1556909211-36987daf7b4d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
      icon: <Table className="h-5 w-5 text-funneepurple" />
    }
  ];

  return (
    <section id="services" className="py-24 bg-gray-50">
      <div className="section-container">
        <motion.div 
          className="text-center mb-16"
          style={{ opacity: titleOpacity, y: titleY }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title text-gradient">{t('services.title')}</h2>
          <p className="section-subtitle">{t('services.subtitle')}</p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {services.map((service, index) => (
            <ServiceCard 
              key={service.id} 
              {...service}
              index={index}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
