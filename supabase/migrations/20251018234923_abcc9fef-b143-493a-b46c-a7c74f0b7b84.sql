-- Rename description column to rules in positions table
ALTER TABLE public.positions 
RENAME COLUMN description TO rules;