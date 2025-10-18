-- Add rating_points column to users table
ALTER TABLE public.users 
ADD COLUMN rating_points INTEGER DEFAULT 100 NOT NULL;