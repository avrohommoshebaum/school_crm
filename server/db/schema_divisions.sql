-- Divisions Schema
-- Allows grouping grades into divisions (e.g., Primary Division, Middle School Division)

-- ============================================
-- DIVISIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE, -- e.g., "Primary Division", "Middle School Division"
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_divisions_name ON divisions(name);

-- ============================================
-- DIVISION GRADES (Many-to-Many)
-- ============================================
-- Links grades to divisions
CREATE TABLE IF NOT EXISTS division_grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    division_id UUID REFERENCES divisions(id) ON DELETE CASCADE,
    grade_id UUID REFERENCES grades(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(division_id, grade_id)
);

CREATE INDEX idx_division_grades_division_id ON division_grades(division_id);
CREATE INDEX idx_division_grades_grade_id ON division_grades(grade_id);

-- ============================================
-- PRINCIPAL DIVISION ASSIGNMENTS
-- ============================================
-- Assigns principals to divisions (similar to grade assignments)
CREATE TABLE IF NOT EXISTS principal_division_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    principal_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    division_id UUID REFERENCES divisions(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(principal_id, division_id)
);

CREATE INDEX idx_principal_division_assignments_principal_id ON principal_division_assignments(principal_id);
CREATE INDEX idx_principal_division_assignments_division_id ON principal_division_assignments(division_id);
CREATE INDEX idx_principal_division_assignments_is_active ON principal_division_assignments(is_active);

-- ============================================
-- UPDATE TRIGGERS
-- ============================================
-- Note: update_updated_at_column() function should already exist from other schemas
-- If it doesn't exist, it will be created by other schema setup scripts

CREATE TRIGGER update_divisions_updated_at BEFORE UPDATE ON divisions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_principal_division_assignments_updated_at BEFORE UPDATE ON principal_division_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
