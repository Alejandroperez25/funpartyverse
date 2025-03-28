
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart, CartItem } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { ShoppingCart as CartIcon, Plus, Minus, X, CreditCard, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ShoppingCartProps {
  side?: "left" | "right" | "top" | "bottom";
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({
  side = "right"
}) => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalPrice,
    clearCart
  } = useCart();
  
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Estados para el diálogo de método de pago
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  
  // Estados para reserva de pago posterior
  const [reservationName, setReservationName] = useState("");
  const [reservationEmail, setReservationEmail] = useState("");
  const [reservationPhone, setReservationPhone] = useState("");
  const [reservationNotes, setReservationNotes] = useState("");

  // Stripe checkout handler
  const handleStripeCheckout = async () => {
    try {
      setProcessing(true);
      
      if (!user) {
        toast({
          title: 'Error',
          description: 'Debes iniciar sesión para realizar un pedido',
          variant: 'destructive',
        });
        setProcessing(false);
        return;
      }
      
      // Call Stripe checkout edge function
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          returnUrl: `${window.location.origin}/checkout/success`,
          paymentMethod: "stripe"
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Redirect to Stripe Checkout
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al procesar tu pedido',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  // Google Pay checkout handler
  const handleGooglePayCheckout = async () => {
    try {
      setProcessing(true);
      
      if (!user) {
        toast({
          title: 'Error',
          description: 'Debes iniciar sesión para realizar un pedido',
          variant: 'destructive',
        });
        setProcessing(false);
        return;
      }
      
      // Call Stripe checkout edge function with Google Pay method
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          returnUrl: `${window.location.origin}/checkout/success`,
          paymentMethod: "google_pay"
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Redirect to Google Pay Checkout
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error('Google Pay checkout error:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al procesar tu pedido con Google Pay',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  // Apple Pay checkout handler
  const handleApplePayCheckout = async () => {
    try {
      setProcessing(true);
      
      if (!user) {
        toast({
          title: 'Error',
          description: 'Debes iniciar sesión para realizar un pedido',
          variant: 'destructive',
        });
        setProcessing(false);
        return;
      }
      
      // Call Stripe checkout edge function with Apple Pay method
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          returnUrl: `${window.location.origin}/checkout/success`,
          paymentMethod: "apple_pay"
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Redirect to Apple Pay Checkout
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error('Apple Pay checkout error:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al procesar tu pedido con Apple Pay',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReservationCheckout = async () => {
    try {
      setProcessing(true);
      
      // Validar datos
      if (!reservationName || !reservationEmail || !reservationPhone) {
        toast({
          title: 'Error',
          description: 'Por favor completa todos los campos requeridos',
          variant: 'destructive',
        });
        setProcessing(false);
        return;
      }
      
      // Check if user is logged in
      if (!user) {
        toast({
          title: 'Error',
          description: 'Debes iniciar sesión para realizar un pedido',
          variant: 'destructive',
        });
        setProcessing(false);
        return;
      }
      
      // Create a new order with 'reserved' status
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: totalPrice,
          status: 'reserved'
        })
        .select()
        .single();
        
      if (orderError) {
        console.error('Error creating order:', orderError);
        throw new Error('No se pudo crear la reserva');
      }
      
      // Add order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
        
      if (itemsError) {
        console.error('Error adding order items:', itemsError);
        throw new Error('No se pudieron guardar los detalles de la reserva');
      }
      
      // Success!
      toast({
        title: 'Reserva realizada',
        description: 'Tu reserva ha sido procesada correctamente. Nos pondremos en contacto contigo pronto.',
      });
      
      // Close dialogs and clear cart
      setPaymentDialogOpen(false);
      setIsOpen(false);
      clearCart();
      
    } catch (error: any) {
      console.error('Reservation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Ocurrió un error al procesar tu reserva',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: 'Iniciar Sesión',
        description: 'Debes iniciar sesión para continuar con la compra',
      });
      setIsOpen(false);
      window.location.href = '/auth';
      return;
    }
    
    setPaymentDialogOpen(true);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="relative rounded-full h-10 w-10 mx-0 py-[13px] px-[28px] bg-orange-500 hover:bg-orange-400">
            <CartIcon className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-funneepurple text-white text-xs">
                {totalItems}
              </span>
            )}
          </Button>
        </SheetTrigger>
        
        <SheetContent side={side} className="w-full sm:max-w-md">
          <SheetHeader className="space-y-2.5 pb-6 border-b">
            <SheetTitle className="text-2xl">{t('cart.title')}</SheetTitle>
          </SheetHeader>
          
          <div className="mt-8 flex flex-col h-[calc(100vh-13rem)]">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <CartIcon className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">{t('cart.empty')}</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-auto space-y-4 pr-2">
                  {items.map(item => (
                    <CartItemCard 
                      key={item.id} 
                      item={item} 
                      onRemove={() => removeFromCart(item.id)} 
                      onUpdateQuantity={quantity => updateQuantity(item.id, quantity)} 
                    />
                  ))}
                </div>
                
                <div className="border-t pt-4 mt-4 space-y-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <Button 
                    className="w-full bg-funneepurple hover:bg-funneepurple/90 text-white" 
                    onClick={handleCheckout}
                    disabled={processing}
                  >
                    {processing ? 'Procesando...' : t('cart.checkout')}
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Payment Method Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Método de Pago</DialogTitle>
            <DialogDescription>
              Selecciona el método de pago que prefieres utilizar.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="stripe" onValueChange={setPaymentMethod} className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stripe" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>Pago Inmediato</span>
              </TabsTrigger>
              <TabsTrigger value="reservation" className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span>Reservar</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="stripe" className="mt-4">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Selecciona una de las opciones de pago disponibles:
                  </p>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button 
                    className="bg-funneepurple hover:bg-funneepurple/90 w-full"
                    onClick={handleStripeCheckout}
                    disabled={processing}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {processing ? 'Procesando...' : 'Tarjeta de Crédito / Débito'}
                  </Button>
                  
                  <Button 
                    className="bg-black hover:bg-black/90 w-full text-white"
                    onClick={handleApplePayCheckout}
                    disabled={processing}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="white">
                      <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.77997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.09 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                    </svg>
                    {processing ? 'Procesando...' : 'Apple Pay'}
                  </Button>
                  
                  <Button 
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 w-full"
                    onClick={handleGooglePayCheckout}
                    disabled={processing}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="white"/>
                      <path d="M7.54492 12.7791V15.3877H9.2539C10.082 15.3877 10.7383 14.7314 10.7383 13.9033C10.7383 13.0752 10.082 12.4189 9.2539 12.4189H7.54492V12.7791Z" fill="#4285F4"/>
                      <path d="M15.0762 13.9033C15.0762 12.2471 13.7324 10.9033 12.0762 10.9033C10.4199 10.9033 9.07617 12.2471 9.07617 13.9033C9.07617 15.5596 10.4199 16.9033 12.0762 16.9033C13.7324 16.9033 15.0762 15.5596 15.0762 13.9033Z" fill="#34A853"/>
                      <path d="M18.543 13.9033C18.543 12.2471 17.1992 10.9033 15.543 10.9033V16.9033C17.1992 16.9033 18.543 15.5596 18.543 13.9033Z" fill="#FBBC04"/>
                      <path d="M4.54492 13.9033C4.54492 15.5596 5.88867 16.9033 7.54492 16.9033V10.9033C5.88867 10.9033 4.54492 12.2471 4.54492 13.9033Z" fill="#EA4335"/>
                    </svg>
                    {processing ? 'Procesando...' : 'Google Pay'}
                  </Button>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                    Cancelar
                  </Button>
                </DialogFooter>
              </div>
            </TabsContent>
            
            <TabsContent value="reservation" className="mt-4">
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-md mb-4">
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    Reserva ahora y paga después mediante transferencia bancaria. 
                    Te contactaremos con los detalles de pago.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nombre*
                    </Label>
                    <Input
                      id="name"
                      value={reservationName}
                      onChange={(e) => setReservationName(e.target.value)}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email*
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={reservationEmail}
                      onChange={(e) => setReservationEmail(e.target.value)}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Teléfono*
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={reservationPhone}
                      onChange={(e) => setReservationPhone(e.target.value)}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                      Notas
                    </Label>
                    <Textarea
                      id="notes"
                      value={reservationNotes}
                      onChange={(e) => setReservationNotes(e.target.value)}
                      className="col-span-3"
                      placeholder="Instrucciones especiales o comentarios..."
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    className="bg-funneepurple hover:bg-funneepurple/90"
                    onClick={handleReservationCheckout}
                    disabled={processing}
                  >
                    {processing ? 'Procesando...' : 'Confirmar Reserva'}
                  </Button>
                </DialogFooter>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface CartItemCardProps {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onRemove,
  onUpdateQuantity
}) => {
  return (
    <motion.div 
      initial={{
        opacity: 0,
        y: 10
      }} 
      animate={{
        opacity: 1,
        y: 0
      }} 
      exit={{
        opacity: 0,
        y: -10
      }} 
      className="flex items-center gap-4 p-3 rounded-lg border bg-card"
    >
      <div className="h-16 w-16 rounded-md overflow-hidden bg-muted">
        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{item.name}</h4>
        <p className="text-muted-foreground text-sm">${item.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full" 
          onClick={() => onUpdateQuantity(item.quantity - 1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center">{item.quantity}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full" 
          onClick={() => onUpdateQuantity(item.quantity + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-full" 
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </motion.div>
  );
};

export default ShoppingCart;
