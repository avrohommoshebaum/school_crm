-- Email Messages and Scheduled Emails Schema
-- Part of School Management System

-- ============================================
-- EMAIL MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('group', 'manual')),
    recipient_group_ids UUID[], -- Array of group IDs
    to_recipients TEXT[], -- Array of email addresses in TO field
    cc_recipients TEXT[], -- Array of email addresses in CC field
    bcc_recipients TEXT[], -- Array of email addresses in BCC field
    from_name VARCHAR(255), -- Custom from name
    reply_to VARCHAR(255), -- Reply-to email address
    disable_reply_to BOOLEAN DEFAULT FALSE,
    sendgrid_message_id VARCHAR(255), -- SendGrid message ID for tracking
    status VARCHAR(50) DEFAULT 'sent', -- sent, failed, etc.
    sent_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_messages_sent_by ON email_messages(sent_by);
CREATE INDEX idx_email_messages_sent_at ON email_messages(sent_at DESC);
CREATE INDEX idx_email_messages_recipient_type ON email_messages(recipient_type);
CREATE INDEX idx_email_messages_status ON email_messages(status);

-- ============================================
-- SCHEDULED EMAILS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scheduled_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('group', 'manual')),
    recipient_group_ids UUID[], -- Array of group IDs
    to_recipients TEXT[], -- Array of email addresses in TO field
    cc_recipients TEXT[], -- Array of email addresses in CC field
    bcc_recipients TEXT[], -- Array of email addresses in BCC field
    from_name VARCHAR(255), -- Custom from name
    reply_to VARCHAR(255), -- Reply-to email address
    disable_reply_to BOOLEAN DEFAULT FALSE,
    attachments JSONB, -- Store attachment metadata (filename, type, etc.)
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
    sent_at TIMESTAMP WITH TIME ZONE, -- When it was actually sent
    email_message_id UUID REFERENCES email_messages(id) ON DELETE SET NULL, -- Link to actual email message if sent
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT -- Error message if sending failed
);

CREATE INDEX idx_scheduled_emails_status ON scheduled_emails(status);
CREATE INDEX idx_scheduled_emails_scheduled_for ON scheduled_emails(scheduled_for);
CREATE INDEX idx_scheduled_emails_created_by ON scheduled_emails(created_by);
CREATE INDEX idx_scheduled_emails_recipient_type ON scheduled_emails(recipient_type);
CREATE INDEX idx_scheduled_emails_pending ON scheduled_emails(scheduled_for) WHERE status = 'pending';

-- Apply updated_at triggers
CREATE TRIGGER update_email_messages_updated_at BEFORE UPDATE ON email_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_emails_updated_at BEFORE UPDATE ON scheduled_emails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

