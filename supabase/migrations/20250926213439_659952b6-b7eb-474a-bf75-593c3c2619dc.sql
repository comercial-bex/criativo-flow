-- Fix remaining functions with mutable search paths
CREATE OR REPLACE FUNCTION public.generate_content_with_openai(prompt_text text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $$
BEGIN
  -- This function will be called by the edge function
  -- It's a placeholder for now
  RETURN 'Content generated successfully';
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;