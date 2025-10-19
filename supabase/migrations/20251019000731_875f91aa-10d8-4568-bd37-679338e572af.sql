-- Drop the problematic RLS policy
DROP POLICY IF EXISTS "Interns can view their company profile" ON public.users;