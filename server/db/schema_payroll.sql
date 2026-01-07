-- ============================================
-- PAYROLL TABLE (Comprehensive payroll tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS staff_payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    
    -- Basic Info
    legal_name VARCHAR(255),
    grade VARCHAR(50), -- Grade assignment
    
    -- Job Information
    job_number_2 VARCHAR(100), -- Job #2
    free_daycare BOOLEAN DEFAULT FALSE,
    misc_2 VARCHAR(255),
    misc_3 VARCHAR(255),
    
    -- Package/Salary Information
    total_package_25_26 DECIMAL(12, 2), -- "25-26 Total Pkg"
    max_quarter DECIMAL(12, 2), -- Max 'QTR
    tuition DECIMAL(12, 2),
    actual_quarter DECIMAL(12, 2), -- Actual QTR
    annual_gross_salary DECIMAL(12, 2),
    
    -- Benefits
    nachlas DECIMAL(12, 2),
    other_benefit DECIMAL(12, 2), -- "Other"
    parsonage DECIMAL(12, 2),
    parsonage_allocation DECIMAL(12, 2),
    travel DECIMAL(12, 2),
    insurance DECIMAL(12, 2),
    cc_name VARCHAR(255), -- CC Name
    cc_annual_amount DECIMAL(12, 2), -- CC Annual Amount
    retirement_403b DECIMAL(12, 2), -- 403B+F:V
    
    -- Paycheck Details
    paycheck_amount DECIMAL(12, 2), -- Paycheck
    monthly_parsonage DECIMAL(12, 2), -- Mthly Parsonage
    travel_stipend DECIMAL(12, 2), -- Travel Stipend
    cc_deduction DECIMAL(12, 2), -- CC deduction
    insurance_deduction DECIMAL(12, 2), -- Insurance Deduction
    annual_adjustment DECIMAL(12, 2), -- Annual Adjustment
    paychecks_remaining INTEGER, -- paychecks remaining
    per_paycheck_adjustment DECIMAL(12, 2), -- per p/c adjustment
    adjusted_check_amount DECIMAL(12, 2), -- adjusted check amt
    
    -- PTO
    pto_days DECIMAL(5, 2), -- PTO DAYS (can be fractional)
    
    -- Academic Year
    academic_year VARCHAR(20), -- e.g., "2025-2026"
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_payroll_staff_id ON staff_payroll(staff_id);
CREATE INDEX idx_staff_payroll_academic_year ON staff_payroll(academic_year);

-- ============================================
-- PAYROLL HISTORY TABLE (Historical payroll changes)
-- ============================================
CREATE TABLE IF NOT EXISTS staff_payroll_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    payroll_id UUID REFERENCES staff_payroll(id) ON DELETE CASCADE,
    
    -- Change date and details
    change_date DATE NOT NULL,
    change_description TEXT,
    change_amount DECIMAL(12, 2),
    change_type VARCHAR(50), -- 'adjustment', 'deduction', 'benefit', 'salary_change', etc.
    
    -- What changed (JSONB for flexibility)
    changes JSONB, -- Store the actual changes made
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_payroll_history_staff_id ON staff_payroll_history(staff_id);
CREATE INDEX idx_staff_payroll_history_payroll_id ON staff_payroll_history(payroll_id);
CREATE INDEX idx_staff_payroll_history_change_date ON staff_payroll_history(change_date);

-- Update trigger
CREATE TRIGGER update_staff_payroll_updated_at BEFORE UPDATE ON staff_payroll
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
