-- Migration: Add provider_name and provider_ein_or_ssn to staff_benefits table
-- Date: 2026-01-08
-- Description: Adds provider information fields for DCAP/childcare benefits

-- Add provider_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'staff_benefits' AND column_name = 'provider_name'
    ) THEN
        ALTER TABLE staff_benefits ADD COLUMN provider_name VARCHAR(255);
    END IF;
END $$;

-- Add provider_ein_or_ssn column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'staff_benefits' AND column_name = 'provider_ein_or_ssn'
    ) THEN
        ALTER TABLE staff_benefits ADD COLUMN provider_ein_or_ssn VARCHAR(50);
    END IF;
END $$;

