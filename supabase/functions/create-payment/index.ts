
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.3";
import Stripe from 'https://esm.sh/stripe@12.18.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Obtener secretos y configurar clientes
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const stripeSecretKey = 'sk_test_51R7gzmQHdPrI53nn6qe7c2zdksq6V5gubpCX6YpPkfsfgbvfe9W2ZlNCUdNqoskaBYfqHxuS7Y1C5hPR4UXafqFO00tKURMQy8';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Obtener datos de la solicitud
    const { items, returnUrl, paymentMethod } = await req.json();
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Los items son requeridos y deben ser un arreglo no vacío');
    }

    // Obtener el usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    // Calcular el monto total
    const totalAmount = items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Configurar los métodos de pago según lo solicitado
    const paymentMethodTypes = ['card'];
    
    // Añadir Apple Pay si se solicitó
    if (paymentMethod === 'apple_pay') {
      paymentMethodTypes.push('apple_pay');
    }
    
    // Añadir Google Pay si se solicitó
    if (paymentMethod === 'google_pay') {
      paymentMethodTypes.push('google_pay');
    }

    // Crear la sesión de checkout de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethodTypes,
      line_items: items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100), // Convertir a centavos
        },
        quantity: item.quantity,
      })),
      payment_intent_data: {
        metadata: {
          user_id: user.id,
        },
      },
      mode: 'payment',
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: returnUrl,
    });

    // Crear la orden en la base de datos
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error('No se pudo crear la orden');
    }

    // Agregar los items a la orden
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
      throw new Error('No se pudieron guardar los detalles de la orden');
    }

    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id,
        orderId: order.id,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
