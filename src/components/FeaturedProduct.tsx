
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Music, Speaker, Video } from 'lucide-react';

const FeaturedProduct: React.FC = () => {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const { scrollY } = useScroll();
  
  // Create scroll-based animations
  const imageX = useTransform(scrollY, [800, 1200], [-30, 0]);
  const contentX = useTransform(scrollY, [800, 1200], [30, 0]);
  const backgroundY = useTransform(scrollY, [800, 1200], [50, 0]);

  const featuredProduct = {
    id: 'inflatable-disco',
    name: t('featured.title'),
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80'
  };

  const handleAddToCart = () => {
    addToCart(featuredProduct);
  };

  const features = [
    { 
      icon: <Music className="w-6 h-6 text-funneepurple" />, 
      title: 'Professional Sound System', 
      description: 'High-quality speakers and audio equipment for crystal clear sound.' 
    },
    { 
      icon: <Video className="w-6 h-6 text-funneepurple" />, 
      title: 'LED Screens', 
      description: 'Vibrant LED displays showing colorful visuals synchronized with the music.' 
    },
    { 
      icon: <Speaker className="w-6 h-6 text-funneepurple" />, 
      title: 'DJ Equipment', 
      description: 'Professional DJ setup with mixing capability for the perfect party soundtrack.' 
    }
  ];

  // Feature animation variants
  const featureContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const featureItem = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="featured" className="py-24 overflow-hidden relative">
      {/* Background decorations with parallax effect */}
      <motion.div 
        style={{ y: backgroundY }} 
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-funneepurple/5 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-funneeblue/5 blur-3xl"></div>
      </motion.div>

      <div className="section-container">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <motion.span 
            className="inline-block px-3 py-1 mb-4 text-sm font-medium bg-funneepurple/10 text-funneepurple rounded-full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Star Product
          </motion.span>
          <h2 className="section-title text-gradient">{t('featured.title')}</h2>
          <p className="section-subtitle">{t('featured.subtitle')}</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Product Image with parallax effect */}
          <motion.div 
            className="lg:w-1/2"
            style={{ x: imageX }}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="relative overflow-hidden rounded-2xl shadow-xl"
              whileHover={{ y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <motion.img 
                  src={featuredProduct.image}
                  alt="Inflatable Disco Dome" 
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 1 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              
              {/* Price tag with hover effect */}
              <motion.div 
                className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm py-2 px-4 rounded-full shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="font-bold text-funneepurple text-xl">${featuredProduct.price}</span>
              </motion.div>
            </motion.div>
          </motion.div>
          
          {/* Product Info with animated entrance */}
          <motion.div 
            className="lg:w-1/2"
            style={{ x: contentX }}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-lg text-gray-600 mb-8">
              {t('featured.description')}
            </p>
            
            <motion.div 
              className="space-y-6 mb-8"
              variants={featureContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
            >
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start gap-4"
                  variants={featureItem}
                >
                  <motion.div 
                    className="flex-shrink-0 p-3 bg-funneepurple/10 rounded-lg"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button 
                  onClick={handleAddToCart}
                  className="bg-funneepurple hover:bg-funneepurple/90 text-white px-8 py-6 text-lg"
                >
                  Add to Cart
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button 
                  variant="outline" 
                  className="border-funneepurple text-funneepurple hover:bg-funneepurple/10 px-8 py-6 text-lg"
                >
                  {t('featured.cta')}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProduct;
