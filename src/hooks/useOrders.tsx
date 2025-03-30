
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Order } from '@/components/orders/OrderTable';
import { useAuth } from '@/context/AuthContext';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const { user, isAdmin, adminChecked } = useAuth();

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      let query = supabase.from('orders');
      
      // If user is admin, fetch all orders, otherwise only user's orders
      if (isAdmin) {
        query = query.select('*');
      } else {
        query = query.select('*').eq('user_id', user.id);
      }
      
      const { data: ordersData, error: ordersError } = await query.order('created_at', { ascending: false });
      
      if (ordersError) {
        throw ordersError;
      }
      
      // Map orders to include user emails and items
      const ordersWithDetails = await Promise.all(
        ordersData.map(async (order) => {
          // Get order items
          const { data: itemsData } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);
          
          let userEmail = 'Guest';
          
          // If there's a user_id, try to get their email
          if (order.user_id) {
            try {
              // Use auth API to get user email
              const { data: userData } = await supabase.auth.admin.getUserById(
                order.user_id
              );
              
              if (userData?.user?.email) {
                userEmail = userData.user.email;
              }
            } catch (error) {
              console.error('Error fetching user details:', error);
            }
          }
          
          return {
            ...order,
            items: itemsData || [],
            user_email: userEmail
          };
        })
      );
      
      setOrders(ordersWithDetails);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los pedidos: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  const handleUpdateOrderStatus = async () => {
    if (!currentOrder) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: currentOrder.status })
        .eq('id', currentOrder.id);
        
      if (error) throw error;
      
      toast({
        title: 'Estado Actualizado',
        description: `El estado del pedido ha sido actualizado a ${currentOrder.status}`,
      });
      
      setOrders(orders.map(o => (o.id === currentOrder.id ? currentOrder : o)));
      setOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del pedido: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const handleOrderStatusChange = (value: string) => {
    if (currentOrder) {
      setCurrentOrder({...currentOrder, status: value});
    }
  };

  useEffect(() => {
    // Only fetch orders when authentication is complete
    if (user && adminChecked) {
      fetchOrders();
    } else if (!user && adminChecked) {
      setOrders([]);
      setLoading(false);
    }
  }, [user, isAdmin, adminChecked, fetchOrders]);

  return {
    orders,
    loading,
    open,
    setOpen,
    currentOrder,
    setCurrentOrder,
    handleUpdateOrderStatus,
    handleOrderStatusChange,
    refreshOrders: fetchOrders
  };
};
