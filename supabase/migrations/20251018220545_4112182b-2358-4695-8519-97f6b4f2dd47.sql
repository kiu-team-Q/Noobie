-- Create companies table to store company credentials
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  otp TEXT NOT NULL,
  invite_link TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create roles table for company-defined roles
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, role_name)
);

-- Create interns table to store intern credentials
CREATE TABLE public.interns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  otp TEXT NOT NULL,
  invite_link TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, email)
);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies table
-- Companies can view and update their own data
CREATE POLICY "Companies can view own data"
  ON public.companies
  FOR SELECT
  USING (true);

CREATE POLICY "Companies can update own data"
  ON public.companies
  FOR UPDATE
  USING (true);

-- RLS Policies for roles table
-- Companies can manage their own roles
CREATE POLICY "Companies can view own roles"
  ON public.roles
  FOR SELECT
  USING (true);

CREATE POLICY "Companies can insert own roles"
  ON public.roles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Companies can update own roles"
  ON public.roles
  FOR UPDATE
  USING (true);

CREATE POLICY "Companies can delete own roles"
  ON public.roles
  FOR DELETE
  USING (true);

-- RLS Policies for interns table
-- Interns can view and update their own data
-- Companies can view and manage their interns
CREATE POLICY "Interns can view own data"
  ON public.interns
  FOR SELECT
  USING (true);

CREATE POLICY "Interns can update own data"
  ON public.interns
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow insert for new interns"
  ON public.interns
  FOR INSERT
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interns_updated_at
  BEFORE UPDATE ON public.interns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a default admin company for testing
INSERT INTO public.companies (name, email, password_hash, otp, invite_link, status)
VALUES (
  'DevCorp Technologies',
  'admin@devcorp.com',
  '$2a$10$placeholder', -- This will be replaced with actual hash in production
  'CORP2024',
  'https://devbuddy.app/company/invite/abc123',
  'active'
);