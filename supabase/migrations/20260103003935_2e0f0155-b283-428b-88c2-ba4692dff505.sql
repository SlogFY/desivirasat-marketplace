-- Make slogbyte@gmail.com an admin
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = '2bb65f53-d5a9-4c38-a32d-82140f3c83e2';

-- If no row exists, insert one
INSERT INTO public.user_roles (user_id, role)
SELECT '2bb65f53-d5a9-4c38-a32d-82140f3c83e2', 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '2bb65f53-d5a9-4c38-a32d-82140f3c83e2' 
  AND role = 'admin'
);