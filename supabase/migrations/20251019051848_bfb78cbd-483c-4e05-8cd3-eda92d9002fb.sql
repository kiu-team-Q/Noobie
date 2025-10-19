-- Drop the problematic RLS policy that causes infinite recursion
DROP POLICY IF EXISTS "Interns can view colleagues in same company and position" ON public.users;

-- Create a security definer function to check if users are in the same company and position
CREATE OR REPLACE FUNCTION public.can_view_colleague(_viewer_id uuid, _viewed_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users viewer, public.users viewed
    WHERE viewer.id = _viewer_id
      AND viewed.id = _viewed_id
      AND viewer.company_id = viewed.company_id
      AND viewer.position_id = viewed.position_id
      AND viewer.company_id IS NOT NULL
      AND viewer.position_id IS NOT NULL
  )
$$;

-- Create a new RLS policy using the security definer function
CREATE POLICY "Interns can view colleagues in same company and position" 
ON public.users 
FOR SELECT 
USING (
  public.can_view_colleague(auth.uid(), id)
);