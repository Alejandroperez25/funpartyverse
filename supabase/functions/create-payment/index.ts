
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.26.0";
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
    // Get configuration and set up clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
    
    if (!stripeSecretKey) {
      console.error('Missing STRIPE_SECRET_KEY env variable');
      throw new Error('Missing STRIPE_SECRET_KEY env variable');
    }
    
    console.log('Creating Supabase client with URL:', supabaseUrl);
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Creating Stripe client with API version 2023-10-16');
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Get request data
    const { items, returnUrl } = await req.json();
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Los items son requeridos y deben ser un arreglo no vacío');
    }

    // Get authorization header and user
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      // Try to get the user if authentication header is present
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error) {
          console.error('Error getting user:', error.message);
        } else if (user) {
          console.log('User authenticated:', user.id);
          userId = user.id;
        }
      } catch (authError) {
        console.error('Authentication error:', authError);
      }
    } else {
      console.log('No authentication header provided. Continue as guest.');
    }

    // Calculate total amount
    const totalAmount = items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    console.log('Creating Stripe checkout session with items:', JSON.stringify(items.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }))));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${returnUrl}?success=false`,
      metadata: {
        user_id: userId || 'guest',
      },
    });

    console.log('Stripe session created successfully:', session.id);

    // Create an order in the database regardless of authentication status
    let orderId = null;
    try {
      // Create order in database with user_id if available, otherwise null
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total_amount: totalAmount,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
      } else if (order) {
        orderId = order.id;

        // Add items to order
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
        }
      }
    } catch (error) {
      console.error('Error in order creation:', error);
    }

    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id,
        orderId: orderId,
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
    console.error('Payment error:', error.message);
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
