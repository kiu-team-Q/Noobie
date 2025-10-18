-- Fix the existing intern user who signed up before the trigger was created
UPDATE public.users 
SET position_id = 'd1809929-cc90-451f-a932-6a254ff6a2dd',
    company_id = 'd55f19c2-551a-40df-9752-7d0ed40f4926'
WHERE id = 'f772dcb5-8542-4dbd-8665-c28959536ebc';

-- Mark the invitation as used
UPDATE public.invitations 
SET used_at = now()
WHERE token = '1b63e102-e4cc-4fe2-ba20-93595b794fd1';