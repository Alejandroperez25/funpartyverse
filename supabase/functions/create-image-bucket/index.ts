
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.26.0";

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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    // Create bucket if it doesn't exist
    const { data: existingBuckets } = await supabaseAdmin
      .storage
      .listBuckets();
    
    if (!existingBuckets?.some(bucket => bucket.name === 'almacenamiento')) {
      const { error } = await supabaseAdmin
        .storage
        .createBucket('almacenamiento', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        });
      
      if (error) {
        throw error;
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'Storage bucket configured successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error setting up storage:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
