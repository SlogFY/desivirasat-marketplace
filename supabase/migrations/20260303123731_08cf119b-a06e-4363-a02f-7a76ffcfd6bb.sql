
CREATE OR REPLACE FUNCTION public.get_top_selling_product_ids(_limit integer DEFAULT 4)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT oi.product_id
  FROM public.order_items oi
  JOIN public.orders o ON o.id = oi.order_id
  WHERE o.status NOT IN ('cancelled', 'refunded')
  GROUP BY oi.product_id
  ORDER BY SUM(oi.quantity) DESC
  LIMIT _limit
$$;
