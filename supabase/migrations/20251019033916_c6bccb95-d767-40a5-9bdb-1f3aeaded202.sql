-- Allow companies to view their interns in the users table
CREATE POLICY "Companies can view their interns"
ON public.users
FOR SELECT
USING (
  auth.uid() = company_id
);

-- Allow companies to view their interns' roles
CREATE POLICY "Companies can view their interns roles"
ON public.user_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = user_roles.user_id
    AND users.company_id = auth.uid()
  )
);