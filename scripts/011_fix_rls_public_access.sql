-- Fix RLS policies to allow public read access to medications
-- This script will enable the app to load medications properly

-- First, check if RLS is enabled on medications table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'medications';

-- Drop ALL existing policies on medications table to start fresh
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'medications'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON medications', pol.policyname);
    END LOOP;
END $$;

-- Create a simple, permissive SELECT policy for everyone
CREATE POLICY "medications_public_read"
    ON medications
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Verify the policy was created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'medications';

-- Also make sure RLS is actually enabled
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Test query to verify it works
SELECT COUNT(*) as medication_count FROM medications;
