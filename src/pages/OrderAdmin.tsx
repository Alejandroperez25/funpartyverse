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
  const [authStatus, setAuthStatus] = useState<'checking' | 'admin' | 'unauthorized'>('checking');
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
    const checkAdminStatus = async () => {
      try {
        // 1. Verificar sesión
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          throw new Error('No autenticado');
        }

        // 2. Obtener perfil del usuario (usando el campo 'role')
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile) {
          throw new Error('Perfil no encontrado');
        }

        // 3. Verificar si tiene rol de admin
        if (profile.role === 'admin') {
          setAuthStatus('admin');
        } else {
          throw new Error('No tiene rol de administrador');
        }

      } catch (error) {
        setAuthStatus('unauthorized');
        toast({
          title: 'Acceso restringido',
          description: 'Se requieren permisos de administrador',
          variant: 'destructive',
        });
        navigate('/');
      }
    };

    checkAdminStatus();
  }, [navigate]);

  // Resto del código permanece igual...
  if (authStatus === 'checking') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Loading />
        <Footer />
      </div>
    );
  }

  if (authStatus !== 'admin') {
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