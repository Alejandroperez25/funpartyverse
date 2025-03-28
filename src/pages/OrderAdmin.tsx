
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

interface OrderItem {
  id: string;
  product_name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  status: string;
  total_amount: number;
  items?: OrderItem[];
  user_email?: string;
}

const OrderAdmin: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      toast({
        title: 'Acceso Restringido',
        description: 'No tienes permisos para acceder a esta página',
        variant: 'destructive',
      });
    } else {
      fetchOrders();
    }
  }, [isAdmin, navigate]);

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
    
    // Get user emails
    const userIds = ordersData.map(order => order.user_id);
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers({
      perPage: 1000,
    });
    
    // Map orders to include user emails and items
    const ordersWithDetails = await Promise.all(
      ordersData.map(async (order) => {
        // Get order items
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);
        
        // Find user email
        const user = userData?.users?.find(u => u.id === order.user_id);
        
        return {
          ...order,
          items: itemsData || [],
          user_email: user?.email || 'Unknown'
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Administración de Pedidos</h1>
          
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xl text-gray-600 dark:text-gray-300">No hay pedidos disponibles</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                      <TableCell>{order.user_email}</TableCell>
                      <TableCell>{format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          order.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : order.status === 'reserved'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status === 'pending' ? 'Pendiente' : 
                           order.status === 'completed' ? 'Completado' : 
                           order.status === 'cancelled' ? 'Cancelado' : 
                           order.status === 'reserved' ? 'Reservado' :
                           order.status}
                        </span>
                      </TableCell>
                      <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setCurrentOrder(order);
                            setOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Editar Pedido</DialogTitle>
                <DialogDescription>
                  Actualizar el estado del pedido
                </DialogDescription>
              </DialogHeader>
              
              {currentOrder && (
                <>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Detalles del Pedido</h3>
                      <p>ID: {currentOrder.id}</p>
                      <p>Cliente: {currentOrder.user_email}</p>
                      <p>Fecha: {format(new Date(currentOrder.created_at), 'dd/MM/yyyy HH:mm')}</p>
                      <p>Total: ${currentOrder.total_amount.toFixed(2)}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Productos</h3>
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
                          {currentOrder.items?.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.product_name}</TableCell>
                              <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Estado</h3>
                      <Select 
                        value={currentOrder.status} 
                        onValueChange={(value) => setCurrentOrder({...currentOrder, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="completed">Completado</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                          <SelectItem value="reserved">Reservado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      onClick={handleUpdateOrderStatus}
                      className="bg-funneepurple hover:bg-funneepurple/90"
                    >
                      Guardar Cambios
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderAdmin;
