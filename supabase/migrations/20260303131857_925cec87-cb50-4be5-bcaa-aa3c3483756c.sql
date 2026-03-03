
-- Payment settings table for admin-controlled Razorpay config
CREATE TABLE public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id text NOT NULL DEFAULT '',
  key_secret text NOT NULL DEFAULT '',
  mode text NOT NULL DEFAULT 'test',
  currency text NOT NULL DEFAULT 'INR',
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Only one row ever needed, insert default
INSERT INTO public.payment_settings (id) VALUES (gen_random_uuid());

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write payment settings
CREATE POLICY "Admins can view payment settings" ON public.payment_settings
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update payment settings" ON public.payment_settings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Add payment columns to orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS razorpay_order_id text,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id text,
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS transaction_date timestamptz,
  ADD COLUMN IF NOT EXISTS refund_status text;
