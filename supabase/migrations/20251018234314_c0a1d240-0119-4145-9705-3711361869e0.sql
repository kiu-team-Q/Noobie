-- Create invitations table
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on invitations
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for invitations
CREATE POLICY "Companies can view their own invitations"
ON public.invitations
FOR SELECT
USING (
  auth.uid() = company_id OR
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Companies can create invitations"
ON public.invitations
FOR INSERT
WITH CHECK (
  auth.uid() = company_id OR
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Companies can update their own invitations"
ON public.invitations
FOR UPDATE
USING (
  auth.uid() = company_id OR
  public.has_role(auth.uid(), 'admin')
);

-- Public can view valid unused invitations (for signup)
CREATE POLICY "Anyone can view valid invitations"
ON public.invitations
FOR SELECT
USING (
  used_at IS NULL AND
  expires_at > now()
);

-- Add trigger for invitations updated_at
CREATE TRIGGER update_invitations_updated_at
BEFORE UPDATE ON public.invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update handle_new_user to support invitation-based signup
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
  
  -- If invite token exists, validate and get invitation details
  IF _invite_token IS NOT NULL THEN
    SELECT * INTO _invitation
    FROM public.invitations
    WHERE token = _invite_token
      AND used_at IS NULL
      AND expires_at > now();
    
    IF _invitation IS NOT NULL THEN
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
      
      RETURN NEW;
    END IF;
  END IF;
  
  -- Fallback to original logic for non-invitation signups
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