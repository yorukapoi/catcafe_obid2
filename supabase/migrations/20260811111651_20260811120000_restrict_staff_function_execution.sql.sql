/*
# Restrict staff approval function execution

1. Security Changes
- Remove EXECUTE access for the public and anonymous roles from the staff approval functions.
- Allow only authenticated users to call the approval status function and the staff status mutation function.

2. Important Notes
- The functions still perform their own approved-staff authorization checks.
- This migration changes permissions only and does not remove or alter user data.
*/

REVOKE ALL ON FUNCTION public.is_approved_staff() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_approved_staff() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_approved_staff() TO authenticated;

REVOKE ALL ON FUNCTION public.set_staff_status(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_staff_status(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.set_staff_status(uuid, text) TO authenticated;