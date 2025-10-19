-- Add RLS policy to allow interns to view other interns in same company and position
CREATE POLICY "Interns can view colleagues in same company and position" 
ON public.users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users AS u
    WHERE u.id = auth.uid()
    AND u.company_id = users.company_id
    AND u.position_id = users.position_id
  )
);