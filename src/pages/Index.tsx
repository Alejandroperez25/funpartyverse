import React, { useEffect, useState } from 'react';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import Services from '@/components/Services';
import FeaturedProduct from '@/components/FeaturedProduct';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface Product {
  id: string | number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
}

const Index: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los productos',
          variant: 'destructive',
        });
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };
    
    fetchProducts();
  }, []);
  
  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      image: product.image || 'https://placehold.co/600x400?text=Sin+Imagen'
    });
    
    toast({
      title: 'Añadido al carrito',
      description: `${product.name} ha sido añadido al carrito`,
    });
  };

  const featuredProducts = products.slice(0, 3);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div>
      <Navbar />
      <Hero />

      <div className="flex justify-center -mt-12 mb-8">
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg cursor-pointer"
          initial={{ y: 0 }}
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <ArrowDown className="h-6 w-6 text-funneepurple" />
        </motion.div>
      </div>

      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Productos Destacados
          </motion.h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-funneepurple"></div>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No hay productos destacados disponibles</p>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {featuredProducts.map((product) => (
                <motion.div 
                  key={product.id} 
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col h-full transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                  variants={item}
                >
                  <div className="relative">
                    <div className="h-64 overflow-hidden">
                      <img 
                        src={product.image || 'https://placehold.co/600x400?text=Sin+Imagen'} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    {product.stock <= 3 && product.stock > 0 && (
                      <Badge className="absolute top-2 left-2 bg-amber-500">¡Últimas unidades!</Badge>
                    )}
                    {product.stock === 0 && (
                      <Badge className="absolute top-2 left-2 bg-red-500">Agotado</Badge>
                    )}
                  </div>
                  
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold">{product.name}</h3>
                      <span className="text-funneepurple font-bold text-lg">${product.price.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">(4.0)</span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-grow">{product.description}</p>
                    
                    <Button 
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-funneepurple hover:bg-funneepurple/90 flex items-center justify-center gap-2"
                      disabled={product.stock <= 0}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {product.stock > 0 ? 'Añadir al Carrito' : 'Agotado'}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
          
          <div className="text-center mt-10">
            <Button 
              onClick={() => window.location.href = '/products'}
              className="bg-funneepurple hover:bg-funneepurple/90"
            >
              Ver todos los productos
            </Button>
          </div>
        </div>
      </section>

      <Services />
      <FeaturedProduct />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
