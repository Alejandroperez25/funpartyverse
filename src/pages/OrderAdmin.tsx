import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';
import OrderTable from '@/components/orders/OrderTable';
import OrderEditDialog from '@/components/orders/OrderEditDialog';
import { useOrders } from '@/hooks/useOrders';
import { supabase } from '@/integrations/supabase/client';

const OrderAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const {
    orders,
    loading,
    open,
    setOpen,
    currentOrder,
    setCurrentOrder,
    handleUpdateOrderStatus,
    handleOrderStatusChange
  } = useOrders();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAdmin(false);
        navigate('/');
        toast({
          title: 'Acceso Restringido',
          description: 'Debes iniciar sesión para acceder a esta página',
          variant: 'destructive',
        });
        return;
      }
      
      // Verificar si el usuario es admin
      const { data: userData } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();
      
      if (userData?.is_admin) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        navigate('/');
        toast({
          title: 'Acceso Restringido',
          description: 'No tienes permisos de administrador',
          variant: 'destructive',
        });
      }
    };
    
    checkAdmin();
  }, [navigate]);

  // Mostrar carga mientras se verifica el estado de admin
  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Loading />
        <Footer />
      </div>
    );
  }

  // Si no es admin, ya se redirigió en el useEffect
  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Loading />
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
            <OrderTable 
              orders={orders} 
              onEditOrder={(order) => {
                setCurrentOrder(order);
                setOpen(true);
              }} 
            />
          )}
          
          <OrderEditDialog 
            open={open}
            onOpenChange={setOpen}
            currentOrder={currentOrder}
            onOrderStatusChange={handleOrderStatusChange}
            onSaveChanges={handleUpdateOrderStatus}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderAdmin;