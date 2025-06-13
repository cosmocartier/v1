-- Clean up any duplicate user profiles
-- This script will keep the most recent profile for each user and remove duplicates

-- First, let's see if there are any duplicates
SELECT id, email, COUNT(*) as count
FROM public.user_profiles
GROUP BY id, email
HAVING COUNT(*) > 1;

-- Delete duplicate profiles, keeping only the most recent one
WITH ranked_profiles AS (
  SELECT 
    id,
    email,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY id ORDER BY created_at DESC) as rn
  FROM public.user_profiles
)
DELETE FROM public.user_profiles
WHERE (id, created_at) IN (
  SELECT id, created_at
  FROM ranked_profiles
  WHERE rn > 1
);

-- Ensure we have a unique constraint on the id column
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_id_unique;

ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_id_unique UNIQUE (id);

-- Also ensure email uniqueness where email is not empty
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_email_unique 
ON public.user_profiles (email) 
WHERE email != '';
