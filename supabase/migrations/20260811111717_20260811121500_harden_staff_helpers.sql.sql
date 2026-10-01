/*
# Harden internal staff helper functions

1. Security Changes
- Make the timestamp trigger function use a fixed search path.
- Remove browser execution access from the signup trigger function.
- Keep the approval mutation available only to signed-in users.
- Keep the approval helper available to signed-in users because protected table policies call it.

2. Important Notes
- The signup trigger still runs automatically when Supabase Auth creates a user.
- No staff, menu, cat, or adoption data is deleted or changed.
*/

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;