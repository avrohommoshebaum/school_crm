-- Staff Management Schema Extensions
-- Adds support for salaries, benefits, and document attachments

-- ============================================
-- STAFF SALARIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS staff_salaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    salary_amount DECIMAL(12, 2) NOT NULL,
    salary_type VARCHAR(50) DEFAULT 'annual', -- 'annual', 'hourly', 'monthly', 'per_diem'
    effective_date DATE NOT NULL,
    end_date DATE, -- NULL if current
    pay_frequency VARCHAR(50) DEFAULT 'monthly', -- 'weekly', 'bi-weekly', 'monthly', 'semi-monthly'
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_salaries_staff_id ON staff_salaries(staff_id);
CREATE INDEX idx_staff_salaries_effective_date ON staff_salaries(effective_date DESC);
CREATE INDEX idx_staff_salaries_end_date ON staff_salaries(end_date);

-- ============================================
-- STAFF BENEFITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS staff_benefits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    benefit_type VARCHAR(100) NOT NULL, -- 'health_insurance', 'dental', 'vision', 'retirement', 'life_insurance', 'disability', 'tuition_reimbursement', 'parsonage', 'other'
    benefit_name VARCHAR(255), -- Specific plan name or description
    provider VARCHAR(255), -- Insurance company, etc.
    coverage_amount DECIMAL(12, 2), -- If applicable
    employee_contribution DECIMAL(12, 2) DEFAULT 0, -- Monthly/annual contribution
    employer_contribution DECIMAL(12, 2) DEFAULT 0,
    effective_date DATE NOT NULL,
    end_date DATE, -- NULL if current
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_benefits_staff_id ON staff_benefits(staff_id);
CREATE INDEX idx_staff_benefits_type ON staff_benefits(benefit_type);
CREATE INDEX idx_staff_benefits_effective_date ON staff_benefits(effective_date DESC);

-- ============================================
-- STAFF DOCUMENTS/ATTACHMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS staff_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL, -- 'resume', 'contract', 'certification', 'license', 'background_check', 'performance_review', 'other'
    document_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL, -- GCS URL or file path
    file_size INTEGER, -- Size in bytes
    mime_type VARCHAR(100), -- 'application/pdf', 'image/jpeg', etc.
    upload_date DATE DEFAULT CURRENT_DATE,
    expiration_date DATE, -- For licenses, certifications that expire
    notes TEXT,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_documents_staff_id ON staff_documents(staff_id);
CREATE INDEX idx_staff_documents_type ON staff_documents(document_type);
CREATE INDEX idx_staff_documents_expiration_date ON staff_documents(expiration_date);

-- Update triggers
CREATE TRIGGER update_staff_salaries_updated_at BEFORE UPDATE ON staff_salaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_benefits_updated_at BEFORE UPDATE ON staff_benefits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_documents_updated_at BEFORE UPDATE ON staff_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

