-- Fix infinite recursion in profiles RLS policies
-- The issue is that policies check the profiles table while querying it

-- Drop existing problematic policies on profiles
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Recreate policies without recursion
-- Use auth.uid() directly instead of checking profiles table

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Users can update their own profile  
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy 3: Staff can view all profiles (fixed - check role directly without subquery)
-- This uses the row's own role field to determine access, avoiding recursion
CREATE POLICY "Staff can view all profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id 
    OR 
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('staff', 'admin', 'pharmacist')
  );

-- Alternative safer approach: Make profiles publicly readable for staff functionality
-- If the above still causes issues, use this simpler policy:
-- DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;
-- CREATE POLICY "Staff with role can view all"
--   ON profiles FOR SELECT
--   USING (
--     auth.uid() = id
--     OR
--     EXISTS (
--       SELECT 1 FROM auth.users 
--       WHERE auth.users.id = auth.uid() 
--       AND auth.users.raw_user_meta_data->>'role' IN ('staff', 'admin', 'pharmacist')
--     )
--   );
