-- Positions Schema
-- Defines system-wide positions that can be assigned to staff

-- ============================================
-- POSITIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE, -- "Teacher", "Principal", "Curriculum Director", etc.
    description TEXT,
    category VARCHAR(100), -- "Academic", "Administrative", "Support", etc.
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_positions_name ON positions(name);
CREATE INDEX idx_positions_category ON positions(category);
CREATE INDEX idx_positions_is_active ON positions(is_active);

-- Update staff_positions to reference positions table
-- First, add position_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'staff_positions' AND column_name = 'position_id'
    ) THEN
        ALTER TABLE staff_positions ADD COLUMN position_id UUID REFERENCES positions(id) ON DELETE SET NULL;
        CREATE INDEX idx_staff_positions_position_id ON staff_positions(position_id);
    END IF;
END $$;

-- Update trigger
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

