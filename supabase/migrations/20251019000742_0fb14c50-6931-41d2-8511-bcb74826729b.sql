-- Create a security definer function to get company info for an intern
CREATE OR REPLACE FUNCTION public.get_intern_company_info(_user_id uuid)
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  email text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id, u.first_name, u.last_name, u.email
  FROM public.users u
  WHERE u.id = (
    SELECT company_id 
    FROM public.users 
    WHERE id = _user_id
  )
$$;