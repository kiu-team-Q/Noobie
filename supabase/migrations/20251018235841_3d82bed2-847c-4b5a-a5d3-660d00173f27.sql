-- Drop and recreate the trigger to ensure it works
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the handle_new_user function with better logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invite_token TEXT;
  _invitation RECORD;
BEGIN
  -- Get invite token from metadata if present
  _invite_token := NEW.raw_user_meta_data->>'invite_token';
  
  -- Log for debugging
  RAISE LOG 'handle_new_user triggered for user %, invite_token: %', NEW.id, _invite_token;
  
  -- If invite token exists, validate and get invitation details
  IF _invite_token IS NOT NULL AND _invite_token != '' THEN
    -- Fetch invitation
    SELECT * INTO _invitation
    FROM public.invitations
    WHERE token = _invite_token
      AND used_at IS NULL
      AND expires_at > now();
    
    -- Check if valid invitation was found
    IF FOUND THEN
      RAISE LOG 'Valid invitation found for token %, position_id: %, company_id: %', 
        _invite_token, _invitation.position_id, _invitation.company_id;
      
      -- Insert into users table with position and company from invitation
      INSERT INTO public.users (id, email, first_name, last_name, company_id, position_id)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        _invitation.company_id,
        _invitation.position_id
      );
      
      -- Mark invitation as used
      UPDATE public.invitations
      SET used_at = now()
      WHERE id = _invitation.id;
      
      -- Insert role as intern
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'intern'::app_role);
      
      RAISE LOG 'User % created with invitation, position_id: %', NEW.id, _invitation.position_id;
      RETURN NEW;
    ELSE
      RAISE LOG 'No valid invitation found for token %', _invite_token;
    END IF;
  END IF;
  
  -- Fallback to original logic for non-invitation signups
  RAISE LOG 'Creating user % without invitation', NEW.id;
  INSERT INTO public.users (id, email, first_name, last_name, company_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    (NEW.raw_user_meta_data->>'company_id')::uuid
  );
  
  -- Insert role into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'intern'::app_role)
  );
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();