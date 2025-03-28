
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
                    Serás redirigido a la pasarela de pago segura de Stripe para completar tu compra.
                    Se aceptan tarjetas de crédito, Apple Pay y Google Pay.
                  </p>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    className="bg-funneepurple hover:bg-funneepurple/90"
                    onClick={handleStripeCheckout}
                    disabled={processing}
                  >
                    {processing ? 'Procesando...' : 'Proceder al Pago'}
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
