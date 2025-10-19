-- Create function to increment user rating points
CREATE OR REPLACE FUNCTION public.increment_user_points(user_id uuid, points_to_add integer)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.users
  SET rating_points = rating_points + points_to_add
  WHERE id = user_id;
$$;