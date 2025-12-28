-- Extended Schema for School Management System
-- This extends the base schema with students, families, staff, classes, grades, etc.

-- ============================================
-- GRADES TABLE (Grade Levels)
-- ============================================
CREATE TABLE IF NOT EXISTS grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL, -- e.g., "Grade 1", "Grade 2", "Kindergarten"
    level INTEGER UNIQUE NOT NULL, -- Numeric level for sorting (1, 2, 3, etc.)
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_grades_level ON grades(level);

-- ============================================
-- FAMILIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_name VARCHAR(255), -- Primary family name
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    phone VARCHAR(50), -- Primary family phone
    email VARCHAR(255), -- Primary family email
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PARENTS/GUARDIANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Link to user account (can be null if no account)
    family_id UUID REFERENCES families(id) ON DELETE SET NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(50), -- "mother", "father", "guardian", "step-parent", etc.
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT, -- Can differ from family address
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    is_primary_contact BOOLEAN DEFAULT FALSE,
    can_pickup BOOLEAN DEFAULT TRUE,
    emergency_contact BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_parents_user_id ON parents(user_id);
CREATE INDEX idx_parents_family_id ON parents(family_id);
CREATE INDEX idx_parents_email ON parents(LOWER(email));

-- ============================================
-- STUDENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Link to user account (if student has login)
    family_id UUID REFERENCES families(id) ON DELETE SET NULL,
    grade_id UUID REFERENCES grades(id) ON DELETE SET NULL,
    student_id VARCHAR(100) UNIQUE, -- School-issued student ID
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(20),
    enrollment_date DATE,
    enrollment_status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'graduated', 'transferred'
    photo_url TEXT,
    medical_notes TEXT,
    allergies TEXT,
    medications TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relationship VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_family_id ON students(family_id);
CREATE INDEX idx_students_grade_id ON students(grade_id);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_enrollment_status ON students(enrollment_status);
CREATE INDEX idx_students_last_name ON students(last_name);

-- ============================================
-- STUDENT SIBLINGS (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS student_siblings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    sibling_id UUID REFERENCES students(id) ON DELETE CASCADE,
    relationship VARCHAR(50), -- "brother", "sister", "step-brother", etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, sibling_id),
    CHECK (student_id != sibling_id) -- Prevent self-reference
);

CREATE INDEX idx_student_siblings_student_id ON student_siblings(student_id);
CREATE INDEX idx_student_siblings_sibling_id ON student_siblings(sibling_id);

-- ============================================
-- STUDENT PARENTS (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS student_parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    relationship VARCHAR(50), -- "mother", "father", "guardian", etc.
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, parent_id)
);

CREATE INDEX idx_student_parents_student_id ON student_parents(student_id);
CREATE INDEX idx_student_parents_parent_id ON student_parents(parent_id);

-- ============================================
-- STAFF TABLE (Teachers, Principals, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Link to user account
    employee_id VARCHAR(100) UNIQUE, -- School-issued employee ID
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    title VARCHAR(255), -- "Mr.", "Mrs.", "Ms.", etc.
    phone VARCHAR(50),
    email VARCHAR(255),
    hire_date DATE,
    termination_date DATE,
    employment_status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'terminated'
    bio TEXT,
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_user_id ON staff(user_id);
CREATE INDEX idx_staff_employee_id ON staff(employee_id);
CREATE INDEX idx_staff_employment_status ON staff(employment_status);

-- ============================================
-- STAFF POSITIONS TABLE (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS staff_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    position_name VARCHAR(255) NOT NULL, -- "Teacher", "Curriculum Director", "Principal", etc.
    grade_id UUID REFERENCES grades(id) ON DELETE SET NULL, -- If position is grade-specific
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_positions_staff_id ON staff_positions(staff_id);
CREATE INDEX idx_staff_positions_grade_id ON staff_positions(grade_id);
CREATE INDEX idx_staff_positions_is_active ON staff_positions(is_active);

-- ============================================
-- STAFF TO GRADES (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS staff_grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    grade_id UUID REFERENCES grades(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(staff_id, grade_id)
);

CREATE INDEX idx_staff_grades_staff_id ON staff_grades(staff_id);
CREATE INDEX idx_staff_grades_grade_id ON staff_grades(grade_id);

-- ============================================
-- CLASSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL, -- e.g., "2B", "6A", "Kindergarten A"
    grade_id UUID REFERENCES grades(id) ON DELETE SET NULL,
    room_number VARCHAR(50),
    academic_year VARCHAR(20), -- e.g., "2024-2025"
    start_date DATE,
    end_date DATE,
    max_students INTEGER,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_classes_grade_id ON classes(grade_id);
CREATE INDEX idx_classes_academic_year ON classes(academic_year);
CREATE INDEX idx_classes_status ON classes(status);

-- ============================================
-- STUDENT CLASSES (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS student_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    enrollment_date DATE,
    withdrawal_date DATE,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'withdrawn', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, class_id)
);

CREATE INDEX idx_student_classes_student_id ON student_classes(student_id);
CREATE INDEX idx_student_classes_class_id ON student_classes(class_id);
CREATE INDEX idx_student_classes_status ON student_classes(status);

-- ============================================
-- STAFF CLASSES (Many-to-Many - Teachers to Classes)
-- ============================================
CREATE TABLE IF NOT EXISTS staff_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'teacher', -- 'teacher', 'assistant', 'substitute'
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(staff_id, class_id)
);

CREATE INDEX idx_staff_classes_staff_id ON staff_classes(staff_id);
CREATE INDEX idx_staff_classes_class_id ON staff_classes(class_id);

-- ============================================
-- STUDENT PRINCIPALS (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS student_principals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE, -- Principal is a type of staff
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, staff_id)
);

CREATE INDEX idx_student_principals_student_id ON student_principals(student_id);
CREATE INDEX idx_student_principals_staff_id ON student_principals(staff_id);

-- ============================================
-- TUTORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tutors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    organization VARCHAR(255),
    specialties TEXT[], -- Array of specialties
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tutors_email ON tutors(LOWER(email));

-- ============================================
-- STUDENT TUTORS (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS student_tutors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    subject VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, tutor_id)
);

CREATE INDEX idx_student_tutors_student_id ON student_tutors(student_id);
CREATE INDEX idx_student_tutors_tutor_id ON student_tutors(tutor_id);

-- ============================================
-- STAFF TUTORS (Many-to-Many - for communication)
-- ============================================
CREATE TABLE IF NOT EXISTS staff_tutors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL, -- Context: communication about which student
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(staff_id, tutor_id, student_id)
);

CREATE INDEX idx_staff_tutors_staff_id ON staff_tutors(staff_id);
CREATE INDEX idx_staff_tutors_tutor_id ON staff_tutors(tutor_id);
CREATE INDEX idx_staff_tutors_student_id ON staff_tutors(student_id);

-- ============================================
-- THERAPISTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS therapists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    organization VARCHAR(255),
    specialty VARCHAR(255), -- "OT", "Speech", "PT", etc.
    license_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_therapists_email ON therapists(LOWER(email));

-- ============================================
-- STUDENT THERAPISTS (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS student_therapists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    therapist_id UUID REFERENCES therapists(id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, therapist_id)
);

CREATE INDEX idx_student_therapists_student_id ON student_therapists(student_id);
CREATE INDEX idx_student_therapists_therapist_id ON student_therapists(therapist_id);

-- ============================================
-- REPORT CARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS report_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    academic_year VARCHAR(20),
    term VARCHAR(50), -- "Q1", "Q2", "Semester 1", etc.
    issued_date DATE,
    overall_grade VARCHAR(10), -- "A", "B", "C", etc. or percentage
    comments TEXT,
    teacher_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    principal_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_report_cards_student_id ON report_cards(student_id);
CREATE INDEX idx_report_cards_class_id ON report_cards(class_id);
CREATE INDEX idx_report_cards_academic_year ON report_cards(academic_year);

-- ============================================
-- TESTS/ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- "test", "quiz", "assignment", "project", etc.
    subject VARCHAR(255),
    date_taken DATE,
    score DECIMAL(10,2), -- Raw score
    max_score DECIMAL(10,2),
    percentage DECIMAL(5,2), -- Calculated percentage
    grade VARCHAR(10), -- "A", "B", "C", etc.
    notes TEXT,
    teacher_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tests_student_id ON tests(student_id);
CREATE INDEX idx_tests_class_id ON tests(class_id);
CREATE INDEX idx_tests_date_taken ON tests(date_taken);

-- ============================================
-- UPDATE TRIGGERS
-- ============================================

CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON grades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON parents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_positions_updated_at BEFORE UPDATE ON staff_positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutors_updated_at BEFORE UPDATE ON tutors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapists_updated_at BEFORE UPDATE ON therapists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_cards_updated_at BEFORE UPDATE ON report_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tests_updated_at BEFORE UPDATE ON tests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

