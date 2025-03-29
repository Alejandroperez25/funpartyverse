
import React, { useEffect, useState } from 'react';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import Services from '@/components/Services';
import FeaturedProduct from '@/components/FeaturedProduct';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
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
    document.title = 'Funnee Kiddee | Premium Party Equipment Rental';
    fetchProducts();
  }, []);

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

  // Animation variants
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow mt-16">
        <Hero />
        
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.h2 
              className="text-3xl font-bold mb-8 text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Nuestros Productos
            </motion.h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-funneepurple"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">No hay productos disponibles en este momento</p>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {products.map((product) => (
                  <motion.div 
                    key={product.id} 
                    className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                    variants={item}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={product.image || 'https://placehold.co/600x400?text=Sin+Imagen'} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold">{product.name}</h3>
                        <span className="text-funneepurple font-bold text-lg">${product.price.toFixed(2)}</span>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">{product.description}</p>
                      
                      {product.stock > 0 ? (
                        <p className="text-sm text-green-600 mb-4">En stock: {product.stock} unidades</p>
                      ) : (
                        <p className="text-sm text-red-600 mb-4">Agotado</p>
                      )}

                      <Button 
                        onClick={() => handleAddToCart(product)}
                        className="w-full bg-funneepurple hover:bg-funneepurple/90 flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105"
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
          </div>
        </section>
        
        <Services />
        <FeaturedProduct />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
