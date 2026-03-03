
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_id text,
ADD COLUMN IF NOT EXISTS delivery_partner text,
ADD COLUMN IF NOT EXISTS tracking_url text,
ADD COLUMN IF NOT EXISTS delivered_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS return_deadline timestamp with time zone;

-- Also add a return_status column for return management
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS return_status text DEFAULT NULL;
-- return_status values: null (no return), 'requested', 'approved', 'rejected', 'completed'
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS return_reason text DEFAULT NULL;

-- Allow admins to view order_items for all orders (needed for admin panel)
CREATE POLICY "Admins can view all order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'support'::app_role)
);
