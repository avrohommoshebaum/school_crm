-- SMS Messages and Scheduled SMS Schema
-- Part of School Management System

-- ============================================
-- SMS MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sms_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT NOT NULL,
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('group', 'individual')),
    recipient_group_id UUID REFERENCES communication_groups(id) ON DELETE SET NULL,
    recipient_member_id UUID REFERENCES group_members(id) ON DELETE SET NULL,
    recipient_phone_numbers TEXT[] NOT NULL, -- Array of phone numbers that received the message
    twilio_message_sid VARCHAR(255), -- Twilio message SID for tracking
    twilio_status VARCHAR(50), -- sent, delivered, failed, etc.
    segments INTEGER DEFAULT 1, -- Number of SMS segments
    sent_by UUID REFERENCES users(id) ON DELETE SET NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sms_messages_sent_by ON sms_messages(sent_by);
CREATE INDEX idx_sms_messages_sent_at ON sms_messages(sent_at DESC);
CREATE INDEX idx_sms_messages_recipient_type ON sms_messages(recipient_type);
CREATE INDEX idx_sms_messages_recipient_group_id ON sms_messages(recipient_group_id);
CREATE INDEX idx_sms_messages_recipient_member_id ON sms_messages(recipient_member_id);
CREATE INDEX idx_sms_messages_twilio_sid ON sms_messages(twilio_message_sid);
CREATE INDEX idx_sms_messages_twilio_status ON sms_messages(twilio_status);

-- ============================================
-- SCHEDULED SMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scheduled_sms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT NOT NULL,
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('group', 'individual')),
    recipient_group_id UUID REFERENCES communication_groups(id) ON DELETE CASCADE,
    recipient_member_id UUID REFERENCES group_members(id) ON DELETE CASCADE,
    recipient_phone_numbers TEXT[] NOT NULL, -- Array of phone numbers to send to
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
    sent_at TIMESTAMP WITH TIME ZONE, -- When it was actually sent
    sms_message_id UUID REFERENCES sms_messages(id) ON DELETE SET NULL, -- Link to actual SMS message if sent
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT -- Error message if sending failed
);

CREATE INDEX idx_scheduled_sms_status ON scheduled_sms(status);
CREATE INDEX idx_scheduled_sms_scheduled_for ON scheduled_sms(scheduled_for);
CREATE INDEX idx_scheduled_sms_created_by ON scheduled_sms(created_by);
CREATE INDEX idx_scheduled_sms_recipient_type ON scheduled_sms(recipient_type);
CREATE INDEX idx_scheduled_sms_pending ON scheduled_sms(scheduled_for) WHERE status = 'pending';

-- Apply updated_at triggers
CREATE TRIGGER update_sms_messages_updated_at BEFORE UPDATE ON sms_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_sms_updated_at BEFORE UPDATE ON scheduled_sms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SMS RECIPIENT LOGS TABLE
-- Tracks individual recipient delivery status for each SMS
-- ============================================
CREATE TABLE IF NOT EXISTS sms_recipient_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sms_message_id UUID NOT NULL REFERENCES sms_messages(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    twilio_sid VARCHAR(255), -- Individual Twilio message SID for this recipient
    status VARCHAR(50), -- queued, sent, delivered, failed, undelivered, etc.
    error_code VARCHAR(20), -- Twilio error code if failed
    error_message TEXT, -- Error message if failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sms_recipient_logs_sms_message_id ON sms_recipient_logs(sms_message_id);
CREATE INDEX idx_sms_recipient_logs_phone_number ON sms_recipient_logs(phone_number);
CREATE INDEX idx_sms_recipient_logs_status ON sms_recipient_logs(status);

CREATE TRIGGER update_sms_recipient_logs_updated_at BEFORE UPDATE ON sms_recipient_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

