
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Required environment variables are not set');
    }

    console.log('Creating Supabase client');
    // Create a Supabase client with the service role key for admin privileges
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    console.log('Checking if bucket exists');
    // Check if the bucket already exists
    const { data: existingBuckets, error: bucketCheckError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketCheckError) {
      throw new Error(`Error checking buckets: ${bucketCheckError.message}`);
    }
    
    const bucketExists = existingBuckets.some(bucket => bucket.name === 'almacenamiento');
    
    if (bucketExists) {
      console.log('Bucket already exists');
      return new Response(
        JSON.stringify({ message: 'Storage bucket already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Creating new bucket');
    // Create the bucket
    const { data, error } = await supabase
      .storage
      .createBucket('almacenamiento', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880, // 5MB
      });
    
    if (error) {
      throw new Error(`Error creating bucket: ${error.message}`);
    }
    
    console.log('Bucket created successfully');
    
    return new Response(
      JSON.stringify({ 
        message: 'Storage bucket created successfully',
        data 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred creating the storage bucket' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
