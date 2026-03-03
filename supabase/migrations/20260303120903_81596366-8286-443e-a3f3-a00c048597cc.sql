INSERT INTO public.user_roles (user_id, role)
VALUES ('52d1dd6e-95d4-415c-9e0b-b6d68a8a4fe3', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;