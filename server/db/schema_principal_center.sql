-- Principal Center Schema
-- Tables for principal overviews and grade assignments

-- ============================================
-- PRINCIPAL GRADE ASSIGNMENTS
-- ============================================
-- Assigns principals to specific grades (admin function)
CREATE TABLE IF NOT EXISTS principal_grade_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    principal_id UUID REFERENCES staff(id) ON DELETE CASCADE, -- Principal (staff member)
    grade_id UUID REFERENCES grades(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Admin who made the assignment
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(principal_id, grade_id)
);

CREATE INDEX idx_principal_grade_assignments_principal_id ON principal_grade_assignments(principal_id);
CREATE INDEX idx_principal_grade_assignments_grade_id ON principal_grade_assignments(grade_id);
CREATE INDEX idx_principal_grade_assignments_is_active ON principal_grade_assignments(is_active);

-- ============================================
-- CLASS OVERVIEWS
-- ============================================
-- Principal notes and observations about classes
CREATE TABLE IF NOT EXISTS class_overviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    principal_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    overview_date DATE NOT NULL,
    hebrew_notes TEXT, -- Hebrew notes column
    english_notes TEXT, -- English notes column
    overall_summary TEXT, -- Overall summary/rating
    behavior_trends TEXT, -- Behavior trends observed
    academic_trends TEXT, -- Academic trends observed
    concerns TEXT, -- Any concerns noted
    positives TEXT, -- Positive observations
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_class_overviews_class_id ON class_overviews(class_id);
CREATE INDEX idx_class_overviews_principal_id ON class_overviews(principal_id);
CREATE INDEX idx_class_overviews_overview_date ON class_overviews(overview_date DESC);

-- ============================================
-- STUDENT OVERVIEWS
-- ============================================
-- Principal notes and observations about individual students
CREATE TABLE IF NOT EXISTS student_overviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    principal_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    overview_date DATE NOT NULL,
    hebrew_notes TEXT, -- Hebrew notes column
    english_notes TEXT, -- English notes column
    behavior_notes TEXT, -- Behavior observations
    academic_notes TEXT, -- Academic observations
    social_notes TEXT, -- Social/peer interaction observations
    concerns TEXT, -- Concerns noted
    positives TEXT, -- Positive observations
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_overviews_student_id ON student_overviews(student_id);
CREATE INDEX idx_student_overviews_principal_id ON student_overviews(principal_id);
CREATE INDEX idx_student_overviews_overview_date ON student_overviews(overview_date DESC);
CREATE INDEX idx_student_overviews_follow_up_required ON student_overviews(follow_up_required);

-- ============================================
-- GRADE OVERVIEWS
-- ============================================
-- Principal notes and observations about entire grades
CREATE TABLE IF NOT EXISTS grade_overviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade_id UUID REFERENCES grades(id) ON DELETE CASCADE,
    principal_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    overview_date DATE NOT NULL,
    hebrew_notes TEXT, -- Hebrew notes column
    english_notes TEXT, -- English notes column
    overall_summary TEXT, -- Overall grade-level summary
    behavior_trends TEXT, -- Grade-wide behavior trends
    academic_trends TEXT, -- Grade-wide academic trends
    concerns TEXT, -- Grade-wide concerns
    positives TEXT, -- Grade-wide positives
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_grade_overviews_grade_id ON grade_overviews(grade_id);
CREATE INDEX idx_grade_overviews_principal_id ON grade_overviews(principal_id);
CREATE INDEX idx_grade_overviews_overview_date ON grade_overviews(overview_date DESC);

-- ============================================
-- UPDATE TRIGGERS
-- ============================================

CREATE TRIGGER update_principal_grade_assignments_updated_at BEFORE UPDATE ON principal_grade_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_overviews_updated_at BEFORE UPDATE ON class_overviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_overviews_updated_at BEFORE UPDATE ON student_overviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grade_overviews_updated_at BEFORE UPDATE ON grade_overviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

