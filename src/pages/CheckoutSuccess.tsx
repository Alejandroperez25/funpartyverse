
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  const success = searchParams.get('success') === 'true';
  const sessionId = searchParams.get('session_id');
  
  useEffect(() => {
    if (success && sessionId) {
      // Clear the cart since payment was successful
      clearCart();
    }
  }, [success, sessionId, clearCart]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 flex items-center justify-center">
        <div className="container max-w-lg mx-auto px-4">
          {success ? (
            <motion.div 
              className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold mb-4">¡Pago Exitoso!</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Tu pedido ha sido procesado correctamente. Pronto recibirás un correo electrónico con los detalles de tu compra.
              </p>
              <div className="flex flex-col space-y-4">
                <Button 
                  onClick={() => navigate('/orders')}
                  className="w-full bg-funneepurple hover:bg-funneepurple/90"
                >
                  Ver Mis Pedidos
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                >
                  Volver al Inicio
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl font-bold mb-4">Pago Cancelado</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Tu proceso de pago ha sido cancelado. Si encontraste algún problema, por favor intenta nuevamente o contacta con soporte.
              </p>
              <div className="flex flex-col space-y-4">
                <Button 
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  Volver al Inicio
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutSuccess;
