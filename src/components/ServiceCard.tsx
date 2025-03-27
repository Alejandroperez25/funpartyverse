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
}
const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  name,
  description,
  price,
  image,
  icon
}) => {
  const {
    addToCart
  } = useCart();
  const handleAddToCart = () => {
    addToCart({
      id,
      name,
      price,
      image
    });
  };
  return <motion.div className="group bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden transition-all border border-gray-100 h-full" whileHover={{
    y: -5
  }} initial={{
    opacity: 0,
    y: 20
  }} whileInView={{
    opacity: 1,
    y: 0
  }} viewport={{
    once: true,
    margin: "-100px"
  }} transition={{
    duration: 0.4
  }}>
      <div className="relative h-52 overflow-hidden">
        <img src={image} alt={name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full">
          {icon}
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold">{name}</h3>
          <div className="text-funneepurple font-bold">${price}</div>
        </div>
        <p className="text-gray-600 text-sm mb-5">{description}</p>
        <Button onClick={handleAddToCart} className="w-full bg-funneepurple hover:bg-funneepurple/90 text-white">
          Add to Cart
        </Button>
      </div>
    </motion.div>;
};
export default ServiceCard;