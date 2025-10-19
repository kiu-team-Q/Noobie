-- Create code_submissions table to track intern's code submissions
CREATE TABLE public.code_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  points_awarded INTEGER DEFAULT 10,
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.code_submissions ENABLE ROW LEVEL SECURITY;

-- Interns can view their own submissions
CREATE POLICY "Interns can view own submissions"
  ON public.code_submissions
  FOR SELECT
  USING (auth.uid() = intern_id OR has_role(auth.uid(), 'admin'::app_role));

-- Interns can create submissions
CREATE POLICY "Interns can create submissions"
  ON public.code_submissions
  FOR INSERT
  WITH CHECK (auth.uid() = intern_id);

-- Companies can view submissions from their interns
CREATE POLICY "Companies can view their interns submissions"
  ON public.code_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = code_submissions.intern_id
      AND users.company_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Create index for faster queries
CREATE INDEX idx_code_submissions_intern_id ON public.code_submissions(intern_id);
CREATE INDEX idx_code_submissions_submitted_at ON public.code_submissions(submitted_at DESC);