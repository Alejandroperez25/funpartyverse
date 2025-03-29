
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Order } from '@/components/orders/OrderTable';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    
    // Get all orders
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (ordersError) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los pedidos',
        variant: 'destructive',
      });
      console.error('Error fetching orders:', ordersError);
      setLoading(false);
      return;
    }
    
    // Map orders to include user emails and items
    const ordersWithDetails = await Promise.all(
      ordersData.map(async (order) => {
        // Get order items
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);
        
        // Get user email
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', order.user_id)
          .single();
        
        // Find user email from auth
        const { data: authData } = await supabase.auth.admin.getUserById(
          order.user_id
        );
        
        return {
          ...order,
          items: itemsData || [],
          user_email: authData?.user?.email || 'Unknown'
        };
      })
    );
    
    setOrders(ordersWithDetails);
    setLoading(false);
  };

  const handleUpdateOrderStatus = async () => {
    if (!currentOrder) return;
    
    const { error } = await supabase
      .from('orders')
      .update({ status: currentOrder.status })
      .eq('id', currentOrder.id);
      
    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del pedido',
        variant: 'destructive',
      });
      console.error('Error updating order:', error);
    } else {
      toast({
        title: 'Estado Actualizado',
        description: `El estado del pedido ha sido actualizado a ${currentOrder.status}`,
      });
      setOrders(orders.map(o => (o.id === currentOrder.id ? currentOrder : o)));
      setOpen(false);
    }
  };

  const handleOrderStatusChange = (value: string) => {
    if (currentOrder) {
      setCurrentOrder({...currentOrder, status: value});
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    open,
    setOpen,
    currentOrder,
    setCurrentOrder,
    handleUpdateOrderStatus,
    handleOrderStatusChange
  };
};
