
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart, CartItem } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { ShoppingCart as CartIcon, Plus, Minus, X } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
  const [isOpen, setIsOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleCheckout = async () => {
    try {
      setProcessing(true);
      
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Error',
          description: 'Debes iniciar sesión para realizar un pedido',
          variant: 'destructive',
        });
        setProcessing(false);
        return;
      }
      
      // Create a new order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: session.user.id,
          total_amount: totalPrice,
          status: 'pending'
        })
        .select()
        .single();
        
      if (orderError) {
        console.error('Error creating order:', orderError);
        toast({
          title: 'Error',
          description: 'No se pudo crear el pedido',
          variant: 'destructive',
        });
        setProcessing(false);
        return;
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
        toast({
          title: 'Error',
          description: 'No se pudieron guardar los detalles del pedido',
          variant: 'destructive',
        });
        setProcessing(false);
        return;
      }
      
      // Success!
      toast({
        title: 'Pedido realizado',
        description: 'Tu pedido ha sido procesado correctamente',
      });
      
      clearCart();
      setIsOpen(false);
    } catch (error) {
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

  return (
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
