-- Allow interns to view their company's user profile
CREATE POLICY "Interns can view their company profile"
ON public.users
FOR SELECT
USING (
  id IN (
    SELECT company_id 
    FROM public.users 
    WHERE id = auth.uid()
  )
);