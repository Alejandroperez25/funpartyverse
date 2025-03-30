
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';
import OrderTable from '@/components/orders/OrderTable';
import OrderEditDialog from '@/components/orders/OrderEditDialog';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const OrderAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, adminChecked } = useAuth();
  const [pageCheckComplete, setPageCheckComplete] = useState(false);

  const {
    orders,
    loading: ordersLoading,
    open,
    setOpen,
    currentOrder,
    setCurrentOrder,
    handleUpdateOrderStatus,
    handleOrderStatusChange
  } = useOrders();

  // Effect to directly check admin status from the database
  useEffect(() => {
    const verifyAdminStatus = async () => {
      if (!user) {
        console.log('No user found, redirecting to auth');
        toast({
          title: 'Acceso Restringido',
          description: 'Debes iniciar sesión para acceder a esta página',
          variant: 'destructive',
        });
        navigate('/auth');
        setPageCheckComplete(true);
        return;
      }

      try {
        // First try checking directly in the profiles table
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profileData && profileData.role === 'admin') {
          console.log('Direct page check: User is admin via profiles');
          setPageCheckComplete(true);
          return; // User is admin, don't redirect
        }
        
        // Check user_roles table as fallback
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .eq('role', 'admin');
        
        if (rolesData && rolesData.length > 0) {
          console.log('Direct page check: User is admin via user_roles');
          setPageCheckComplete(true);
          return; // User is admin, don't redirect
        }
        
        // If we reach here, user is not admin
        console.log('Direct page check: User is NOT admin - redirecting');
        navigate('/');
        toast({
          title: 'Acceso Restringido',
          description: 'No tienes permisos para acceder a esta página',
          variant: 'destructive',
        });
        setPageCheckComplete(true);
      } catch (error) {
        console.error('Error directly checking admin status:', error);
        // On error, fall back to context value
        if (!isAdmin && adminChecked) {
          navigate('/');
          toast({
            title: 'Acceso Restringido',
            description: 'No tienes permisos para acceder a esta página',
            variant: 'destructive',
          });
        }
        setPageCheckComplete(true);
      }
    };

    if (!authLoading && user && !pageCheckComplete) {
      verifyAdminStatus();
    } else if (!authLoading && !user && !pageCheckComplete) {
      navigate('/auth');
      setPageCheckComplete(true);
    }
  }, [user, authLoading, isAdmin, adminChecked, pageCheckComplete, navigate]);

  if (authLoading || !pageCheckComplete) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loading />
          <div className="text-center">
            <p className="mt-4">Verificando permisos de administrador...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || (!isAdmin && adminChecked && pageCheckComplete)) {
    // Will be redirected by the effect
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p>Redirigiendo...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (ordersLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loading />
          <div className="text-center">
            <p className="mt-4">Cargando pedidos...</p>
          </div>
        </div>
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
