
-- Create storage bucket if it does not exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'almacenamiento', 'almacenamiento', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'almacenamiento');

-- Make sure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own objects" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own objects" ON storage.objects;
DROP POLICY IF EXISTS "Allow administrators to manage all objects" ON storage.objects;

-- Create policy to allow anyone to read objects in the storage bucket
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'almacenamiento');

-- Create policy to allow authenticated users to upload objects
CREATE POLICY "Allow authenticated users to upload" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'almacenamiento');

-- Create policy to allow users to update their own objects
CREATE POLICY "Allow users to update own objects" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'almacenamiento' 
    AND (auth.uid() = owner OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ))
  );

-- Create policy to allow users to delete their own objects
CREATE POLICY "Allow users to delete own objects" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'almacenamiento' 
    AND (auth.uid() = owner OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ))
  );

-- Create policy to allow administrators to manage all objects
CREATE POLICY "Allow administrators to manage all objects" ON storage.objects
  TO authenticated
  USING (
    bucket_id = 'almacenamiento'
    AND EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add RLS policies to the products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated admin insert" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated admin update" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated admin delete" ON public.products;

-- Create policies for products table
CREATE POLICY "Allow public read access" ON public.products
  FOR SELECT
  TO PUBLIC;

CREATE POLICY "Allow authenticated admin insert" ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow authenticated admin update" ON public.products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow authenticated admin delete" ON public.products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add RLS policies to the orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow users to view own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admins to view all orders" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.orders;
DROP POLICY IF EXISTS "Allow admins to update any order" ON public.orders;
DROP POLICY IF EXISTS "Allow users to update own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admins to delete any order" ON public.orders;

-- Create policies for orders table
CREATE POLICY "Allow users to view own orders" ON public.orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow admins to view all orders" ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow authenticated insert" ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow admins to update any order" ON public.orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow users to update own orders" ON public.orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow admins to delete any order" ON public.orders
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add RLS policies to the order_items table
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow users to view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow admins to view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.order_items;
DROP POLICY IF EXISTS "Allow admins to update any order item" ON public.order_items;
DROP POLICY IF EXISTS "Allow admins to delete any order item" ON public.order_items;

-- Create policies for order_items table
CREATE POLICY "Allow users to view own order items" ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE public.orders.id = public.order_items.order_id 
      AND public.orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow admins to view all order items" ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow authenticated insert" ON public.order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE public.orders.id = public.order_items.order_id 
      AND (public.orders.user_id = auth.uid() OR public.orders.user_id IS NULL)
    )
  );

CREATE POLICY "Allow admins to update any order item" ON public.order_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow admins to delete any order item" ON public.order_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
