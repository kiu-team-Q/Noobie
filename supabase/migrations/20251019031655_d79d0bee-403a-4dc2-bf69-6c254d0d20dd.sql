-- Add feedback column to code_submissions
ALTER TABLE public.code_submissions
ADD COLUMN feedback TEXT;