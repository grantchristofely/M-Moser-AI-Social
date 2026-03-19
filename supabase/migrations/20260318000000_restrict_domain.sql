-- Trigger to restrict sign-ups to @mmoser.com domain
CREATE OR REPLACE FUNCTION public.check_email_domain()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email NOT LIKE '%@mmoser.com' THEN
    RAISE EXCEPTION 'Registration is restricted to @mmoser.com email addresses.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS tr_restrict_email_domain ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER tr_restrict_email_domain
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.check_email_domain();
