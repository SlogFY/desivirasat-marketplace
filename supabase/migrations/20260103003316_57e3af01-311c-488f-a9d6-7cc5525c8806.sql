-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);

-- Allow anyone to view product images
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Allow admins and product managers to upload images
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'product_manager'))
);

-- Allow admins and product managers to update images
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' 
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'product_manager'))
);

-- Allow admins to delete images
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' 
  AND public.has_role(auth.uid(), 'admin')
);