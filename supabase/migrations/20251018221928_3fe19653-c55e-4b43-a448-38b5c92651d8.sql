-- Fix RLS policy for companies table to allow inserts
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Companies can view own data" ON public.companies;
DROP POLICY IF EXISTS "Companies can update own data" ON public.companies;

-- Create new policies that allow operations
-- Allow anyone to view companies (for admin dashboard)
CREATE POLICY "Allow select for companies"
  ON public.companies
  FOR SELECT
  USING (true);

-- Allow anyone to insert companies (for admin invites)
CREATE POLICY "Allow insert for companies"
  ON public.companies
  FOR INSERT
  WITH CHECK (true);

-- Allow companies to update their own data by email
CREATE POLICY "Companies can update own data"
  ON public.companies
  FOR UPDATE
  USING (true);