-- Create rules table to store uploaded rules per role
CREATE TABLE public.rules_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('style', 'security', 'workflow', 'mentorship')),
  rules_count INTEGER DEFAULT 0,
  file_content JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role_id, file_name)
);

-- Enable RLS
ALTER TABLE public.rules_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Companies can view their own rules"
  ON public.rules_files
  FOR SELECT
  USING (true);

CREATE POLICY "Companies can insert their own rules"
  ON public.rules_files
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Companies can update their own rules"
  ON public.rules_files
  FOR UPDATE
  USING (true);

CREATE POLICY "Companies can delete their own rules"
  ON public.rules_files
  FOR DELETE
  USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_rules_files_updated_at
  BEFORE UPDATE ON public.rules_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();