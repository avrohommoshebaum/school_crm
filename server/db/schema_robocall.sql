-- ============================================
-- ROBOCALL MESSAGES TABLE
-- Stores robocall message records
-- ============================================
CREATE TABLE IF NOT EXISTS robocall_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recording_method VARCHAR(20) NOT NULL CHECK (recording_method IN ('text-to-speech', 'call-to-record', 'device-record', 'upload')),
    text_content TEXT, -- For text-to-speech
    audio_gcs_path TEXT, -- Path to audio file in GCS (e.g., 'robocalls/1234567890_file.mp3')
    audio_url TEXT, -- Signed URL to audio file (temporary, regenerated as needed)
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('group', 'manual', 'mixed')),
    recipient_group_ids UUID[], -- Array of group IDs
    recipient_phone_numbers TEXT[], -- Array of phone numbers (for manual recipients)
    twilio_status VARCHAR(20) DEFAULT 'queued' CHECK (twilio_status IN ('queued', 'initiated', 'ringing', 'in-progress', 'completed', 'busy', 'no-answer', 'failed', 'canceled')),
    total_recipients INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    fail_count INTEGER DEFAULT 0,
    sent_by UUID REFERENCES users(id) ON DELETE SET NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_robocall_messages_sent_by ON robocall_messages(sent_by);
CREATE INDEX idx_robocall_messages_sent_at ON robocall_messages(sent_at DESC);
CREATE INDEX idx_robocall_messages_twilio_status ON robocall_messages(twilio_status);
CREATE INDEX idx_robocall_messages_recipient_type ON robocall_messages(recipient_type);

-- ============================================
-- SCHEDULED ROBOCALLS TABLE
-- Stores scheduled robocall messages
-- ============================================
CREATE TABLE IF NOT EXISTS scheduled_robocalls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recording_method VARCHAR(20) NOT NULL CHECK (recording_method IN ('text-to-speech', 'call-to-record', 'device-record', 'upload')),
    text_content TEXT, -- For text-to-speech
    audio_gcs_path TEXT, -- Path to audio file in GCS
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('group', 'manual', 'mixed')),
    recipient_group_ids UUID[], -- Array of group IDs
    recipient_phone_numbers TEXT[], -- Array of phone numbers (for manual recipients)
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
    sent_at TIMESTAMP WITH TIME ZONE, -- When it was actually sent
    robocall_message_id UUID REFERENCES robocall_messages(id) ON DELETE SET NULL, -- Link to actual robocall message if sent
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT -- Error message if sending failed
);

CREATE INDEX idx_scheduled_robocalls_status ON scheduled_robocalls(status);
CREATE INDEX idx_scheduled_robocalls_scheduled_for ON scheduled_robocalls(scheduled_for);
CREATE INDEX idx_scheduled_robocalls_created_by ON scheduled_robocalls(created_by);
CREATE INDEX idx_scheduled_robocalls_recipient_type ON scheduled_robocalls(recipient_type);
CREATE INDEX idx_scheduled_robocalls_pending ON scheduled_robocalls(scheduled_for) WHERE status = 'pending';

-- ============================================
-- ROBOCALL RECIPIENT LOGS TABLE
-- Tracks individual recipient call status for each robocall
-- ============================================
CREATE TABLE IF NOT EXISTS robocall_recipient_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    robocall_message_id UUID NOT NULL REFERENCES robocall_messages(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    twilio_call_sid TEXT, -- Twilio Call SID
    twilio_status VARCHAR(50), -- Status from Twilio (queued, ringing, in-progress, completed, busy, no-answer, failed, canceled)
    duration INTEGER, -- Call duration in seconds
    error_code INTEGER, -- Twilio error code if failed
    error_message TEXT, -- Error message if failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_robocall_recipient_logs_robocall_id ON robocall_recipient_logs(robocall_message_id);
CREATE INDEX idx_robocall_recipient_logs_phone ON robocall_recipient_logs(phone_number);
CREATE INDEX idx_robocall_recipient_logs_twilio_status ON robocall_recipient_logs(twilio_status);

-- ============================================
-- SAVED AUDIO RECORDINGS TABLE
-- Stores metadata for saved audio recordings (for reuse)
-- ============================================
CREATE TABLE IF NOT EXISTS saved_audio_recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    audio_gcs_path TEXT NOT NULL, -- Path to audio file in GCS
    duration_seconds INTEGER, -- Duration in seconds (if available)
    file_size_bytes BIGINT, -- File size in bytes
    recording_method VARCHAR(20) NOT NULL CHECK (recording_method IN ('call-to-record', 'device-record', 'upload')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_saved_audio_recordings_created_by ON saved_audio_recordings(created_by);
CREATE INDEX idx_saved_audio_recordings_created_at ON saved_audio_recordings(created_at DESC);

-- ============================================
-- CALL-TO-RECORD SESSIONS TABLE
-- Tracks call-to-record sessions (when user requests a call to record)
-- ============================================
CREATE TABLE IF NOT EXISTS call_to_record_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL, -- Phone number to call
    twilio_call_sid TEXT, -- Twilio Call SID for the recording call
    recording_sid TEXT, -- Twilio Recording SID (after recording is complete)
    recording_url TEXT, -- URL to the recording (temporary)
    recording_gcs_path TEXT, -- Path to recording in GCS (after upload)
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'calling', 'recording', 'completed', 'failed')),
    expires_at TIMESTAMP WITH TIME ZONE, -- When this session expires
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_call_to_record_sessions_user_id ON call_to_record_sessions(user_id);
CREATE INDEX idx_call_to_record_sessions_twilio_call_sid ON call_to_record_sessions(twilio_call_sid);
CREATE INDEX idx_call_to_record_sessions_status ON call_to_record_sessions(status);
CREATE INDEX idx_call_to_record_sessions_expires_at ON call_to_record_sessions(expires_at);

-- Apply updated_at triggers
CREATE TRIGGER update_robocall_messages_updated_at BEFORE UPDATE ON robocall_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_robocalls_updated_at BEFORE UPDATE ON scheduled_robocalls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_audio_recordings_updated_at BEFORE UPDATE ON saved_audio_recordings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_to_record_sessions_updated_at BEFORE UPDATE ON call_to_record_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TWILIO WEBHOOK TOKENS TABLE
-- Stores unique tokens for TwiML endpoint security
-- Tokens are generated per call and expire after 1 hour
-- ============================================
CREATE TABLE IF NOT EXISTS twilio_webhook_tokens (
    token TEXT PRIMARY KEY,
    call_sid TEXT, -- Optional Twilio Call SID
    session_id UUID, -- Optional session ID (for call-to-record)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_twilio_webhook_tokens_expires_at ON twilio_webhook_tokens(expires_at);
CREATE INDEX idx_twilio_webhook_tokens_call_sid ON twilio_webhook_tokens(call_sid);
CREATE INDEX idx_twilio_webhook_tokens_session_id ON twilio_webhook_tokens(session_id);

