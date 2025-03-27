
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface OrderItem {
  id: string;
  product_name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        fetchOrders(session.user.id);
      } else {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);

  const fetchOrders = async (userId: string) => {
    setLoading(true);
    
    // Get all orders for the user
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (ordersError) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar tus pedidos',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }
    
    // For each order, get its items
    const ordersWithItems = await Promise.all(
      ordersData.map(async (order) => {
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);
          
        if (itemsError) {
          console.error('Error fetching order items:', itemsError);
          return { ...order, items: [] };
        }
        
        return { ...order, items: itemsData };
      })
    );
    
    setOrders(ordersWithItems);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-funneepurple"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-2xl font-bold mb-4">Acceso Restringido</h1>
            <p className="mb-6">Debes iniciar sesión para ver tus pedidos</p>
            <Button onClick={() => window.location.href = '/login'}>
              Iniciar Sesión
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <motion.h1 
            className="text-3xl font-bold mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Mis Pedidos
          </motion.h1>
          
          {orders.length === 0 ? (
            <motion.div 
              className="text-center py-12 bg-gray-50 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-xl text-gray-600 mb-4">No tienes pedidos todavía</p>
              <Button onClick={() => window.location.href = '/products'}>
                Ver Productos
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Accordion type="single" collapsible className="space-y-4">
                {orders.map((order, index) => (
                  <AccordionItem
                    key={order.id}
                    value={order.id}
                    className="bg-white rounded-lg shadow-sm border overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between w-full text-left">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            Pedido #{index + 1}
                          </span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}
                          </span>
                        </div>
                        <div className="flex space-x-4 mt-2 md:mt-0">
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            order.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : order.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status === 'pending' ? 'Pendiente' : 
                             order.status === 'completed' ? 'Completado' : 
                             order.status === 'cancelled' ? 'Cancelado' : 
                             order.status}
                          </span>
                          <span className="font-semibold">${order.total_amount.toFixed(2)}</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-right">Precio</TableHead>
                            <TableHead className="text-right">Cantidad</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.product_name}</TableCell>
                              <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
                            <TableCell className="text-right font-bold">${order.total_amount.toFixed(2)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
