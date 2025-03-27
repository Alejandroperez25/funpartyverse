
import React from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

interface ServiceCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  icon: React.ReactNode;
  index?: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  name,
  description,
  price,
  image,
  icon,
  index = 0
}) => {
  const { addToCart } = useCart();
  
  const handleAddToCart = () => {
    addToCart({
      id,
      name,
      price,
      image
    });
  };

  // Individual card animation variant
  const item = {
    hidden: { opacity: 0, y: 50 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.25, 0, 1]
      }
    }
  };
  
  return (
    <motion.div 
      className="group bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden transition-all border border-gray-100 h-full" 
      variants={item}
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
    >
      <div className="relative h-52 overflow-hidden">
        <motion.img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-700"
          whileHover={{ scale: 1.1 }}
        />
        
        <motion.div 
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {icon}
        </motion.div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold">{name}</h3>
          <div className="text-funneepurple font-bold">${price}</div>
        </div>
        <p className="text-gray-600 text-sm mb-5">{description}</p>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button 
            onClick={handleAddToCart} 
            className="w-full bg-funneepurple hover:bg-funneepurple/90 text-white"
          >
            Add to Cart
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
