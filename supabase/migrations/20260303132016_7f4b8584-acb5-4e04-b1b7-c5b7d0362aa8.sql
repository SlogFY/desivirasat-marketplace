
-- Allow anyone authenticated to check if payments are enabled (only read enabled + key_id columns via RPC)
CREATE OR REPLACE FUNCTION public.is_razorpay_enabled()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT enabled AND key_id != '' FROM public.payment_settings LIMIT 1),
    false
  )
$$;
