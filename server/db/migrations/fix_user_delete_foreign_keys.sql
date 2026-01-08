-- Migration: Fix foreign key constraints for user deletion
-- Date: 2026-01-08
-- Description: Allows NULL values in sent_by and created_by columns so user deletion can work properly
-- These columns had NOT NULL but ON DELETE SET NULL which was contradictory

-- Make sent_by nullable in sms_messages
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sms_messages' 
        AND column_name = 'sent_by' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE sms_messages ALTER COLUMN sent_by DROP NOT NULL;
    END IF;
END $$;

-- Make created_by nullable in scheduled_sms
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scheduled_sms' 
        AND column_name = 'created_by' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE scheduled_sms ALTER COLUMN created_by DROP NOT NULL;
    END IF;
END $$;

-- Make sent_by nullable in email_messages
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'email_messages' 
        AND column_name = 'sent_by' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE email_messages ALTER COLUMN sent_by DROP NOT NULL;
    END IF;
END $$;

-- Make created_by nullable in scheduled_emails
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scheduled_emails' 
        AND column_name = 'created_by' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE scheduled_emails ALTER COLUMN created_by DROP NOT NULL;
    END IF;
END $$;

-- Make sent_by nullable in robocall_messages
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'robocall_messages' 
        AND column_name = 'sent_by' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE robocall_messages ALTER COLUMN sent_by DROP NOT NULL;
    END IF;
END $$;

-- Make created_by nullable in scheduled_robocalls
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scheduled_robocalls' 
        AND column_name = 'created_by' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE scheduled_robocalls ALTER COLUMN created_by DROP NOT NULL;
    END IF;
END $$;

-- Make created_by nullable in saved_audio_recordings
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'saved_audio_recordings' 
        AND column_name = 'created_by' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE saved_audio_recordings ALTER COLUMN created_by DROP NOT NULL;
    END IF;
END $$;

