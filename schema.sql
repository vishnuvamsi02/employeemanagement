-- ====================================================================
-- SaaS Multi-Tenant HRMS Database Schema (PostgreSQL 15+)
-- Built to strictly satisfy all 25 sections of the Employee Specification
-- ====================================================================

-- 1. Companies (Tenants)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    currency_symbol VARCHAR(10) DEFAULT '₹',
    working_days_per_week INT DEFAULT 6,
    weekly_off_days INT[] DEFAULT '{0}', -- 0 = Sunday
    standard_working_hours NUMERIC(4,2) DEFAULT 8.0,
    salary_calculation_basis VARCHAR(50) DEFAULT '30_days', -- '30_days', 'calendar_days', 'working_days'
    overtime_multiplier NUMERIC(3,2) DEFAULT 1.0,
    half_day_deduction_percent NUMERIC(5,2) DEFAULT 50.0,
    white_collar_default_leave_quota INT DEFAULT 12,
    blue_collar_default_leave_quota INT DEFAULT 0,
    payroll_cycle_day INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users & Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'supervisor', 'accountant')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, email)
);

-- 3. Employees Table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    joining_date DATE NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    employee_type VARCHAR(50) NOT NULL CHECK (employee_type IN ('white_collar', 'blue_collar')),
    salary NUMERIC(12,2) NOT NULL, -- Monthly base salary
    salary_frequency VARCHAR(20) DEFAULT 'monthly',
    employment_status VARCHAR(50) DEFAULT 'active',
    paid_leave_allowance INT DEFAULT 12,
    used_paid_leaves INT DEFAULT 0,
    overtime_eligible BOOLEAN DEFAULT TRUE,
    overtime_rate_multiplier NUMERIC(3,2) DEFAULT 1.0,
    
    -- Bank Information
    bank_account_name VARCHAR(255),
    bank_account_number VARCHAR(100),
    bank_name VARCHAR(150),
    bank_ifsc VARCHAR(50),
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, employee_code)
);

-- 4. Attendance Records
CREATE TABLE attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('present', 'absent', 'half_day', 'paid_leave', 'unpaid_leave', 'holiday', 'weekly_off')),
    working_hours NUMERIC(4,2) DEFAULT 8.0,
    overtime_hours NUMERIC(4,2) DEFAULT 0.0,
    notes TEXT,
    marked_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, date) -- Prevents accidental duplicate attendance
);

-- 5. Leave Requests & Sanction Decisions
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count NUMERIC(4,1) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- Crucial Spec Requirement: Paid vs Deducted Choice
    approval_type VARCHAR(50) CHECK (approval_type IN ('paid_leave', 'deducted_salary_leave')),
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Overtime Records
CREATE TABLE overtime_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    hours NUMERIC(4,2) NOT NULL,
    hourly_rate NUMERIC(10,2) NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    recorded_by VARCHAR(255) NOT NULL,
    approved_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Salary Advances (Section 25 Spec)
CREATE TABLE salary_advances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    advance_code VARCHAR(50) NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    advance_date DATE NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    reason TEXT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    amount_recovered NUMERIC(12,2) DEFAULT 0.0,
    remaining_balance NUMERIC(12,2) NOT NULL,
    expected_settlement_date DATE,
    recovery_mode VARCHAR(50) NOT NULL CHECK (recovery_mode IN ('full_next_month', 'monthly_installment', 'custom_amount')),
    monthly_installment_amount NUMERIC(12,2),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'settled', 'rejected')),
    approved_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_advance_recovery_limit CHECK (amount_recovered <= amount),
    CONSTRAINT check_balance_non_negative CHECK (remaining_balance >= 0)
);

-- 8. Salary Advance Deductions History
CREATE TABLE advance_recoveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advance_id UUID NOT NULL REFERENCES salary_advances(id) ON DELETE CASCADE,
    payroll_month VARCHAR(7) NOT NULL, -- 'YYYY-MM'
    recovery_date DATE NOT NULL,
    amount_deducted NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Expenses (Office Overhead & Employee Reimbursements)
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    expense_code VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    expense_type VARCHAR(50) NOT NULL CHECK (expense_type IN ('office', 'employee')),
    paid_by VARCHAR(255) NOT NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    vendor VARCHAR(255),
    payment_method VARCHAR(50) NOT NULL,
    receipt_url TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Monthly Payroll Runs & Item Calculations
CREATE TABLE monthly_payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    payroll_month VARCHAR(7) NOT NULL, -- 'YYYY-MM'
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'finalized')),
    total_base_salary NUMERIC(14,2) NOT NULL,
    total_overtime NUMERIC(14,2) NOT NULL,
    total_additions NUMERIC(14,2) NOT NULL,
    total_deductions NUMERIC(14,2) NOT NULL,
    total_net_payable NUMERIC(14,2) NOT NULL,
    finalized_at TIMESTAMP WITH TIME ZONE,
    finalized_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, payroll_month)
);

CREATE TABLE payroll_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id UUID NOT NULL REFERENCES monthly_payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    base_salary NUMERIC(12,2) NOT NULL,
    daily_salary NUMERIC(10,2) NOT NULL,
    hourly_rate NUMERIC(10,2) NOT NULL,
    
    present_days INT NOT NULL,
    half_days INT NOT NULL,
    paid_leave_days INT NOT NULL,
    unpaid_leave_days INT NOT NULL,
    absent_days INT NOT NULL,
    
    overtime_hours NUMERIC(6,2) DEFAULT 0.0,
    overtime_earnings NUMERIC(12,2) DEFAULT 0.0,
    bonuses NUMERIC(12,2) DEFAULT 0.0,
    allowances NUMERIC(12,2) DEFAULT 0.0,
    
    absent_deductions NUMERIC(12,2) DEFAULT 0.0,
    unpaid_leave_deductions NUMERIC(12,2) DEFAULT 0.0,
    half_day_deductions NUMERIC(12,2) DEFAULT 0.0,
    advance_recovery NUMERIC(12,2) DEFAULT 0.0,
    other_deductions NUMERIC(12,2) DEFAULT 0.0,
    
    final_payable_salary NUMERIC(12,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Dedicated System Activity Logs & Audit Trail Table
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL, -- Who performed the action (e.g. 'Vikram Patel', 'Rajesh Sharma')
    user_role VARCHAR(50) NOT NULL CHECK (user_role IN ('owner', 'supervisor', 'accountant')),
    action VARCHAR(255) NOT NULL, -- Action performed (e.g. 'Marked Attendance', 'Approved Leave', 'Sanctioned Salary Advance')
    module VARCHAR(100) NOT NULL, -- 'Attendance', 'Leaves', 'Overtime', 'Advances', 'Expenses', 'Payroll', 'Settings', 'Employees'
    target_entity VARCHAR(100), -- Entity affected: 'Employee', 'LeaveRequest', 'SalaryAdvance', etc.
    target_id VARCHAR(100), -- ID of the target record
    details TEXT NOT NULL, -- Detailed description of the modifications or changes made
    modifications_json JSONB, -- JSON payload of the delta/changed fields
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Legacy compatibility alias
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(255) NOT NULL,
    module VARCHAR(100) NOT NULL,
    details TEXT NOT NULL
);

-- Indexes for performance & multi-tenant isolation
CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_attendances_emp_date ON attendances(employee_id, date);
CREATE INDEX idx_attendances_company_date ON attendances(company_id, date);
CREATE INDEX idx_overtime_emp_date ON overtime_records(employee_id, date);
CREATE INDEX idx_advances_emp ON salary_advances(employee_id);
CREATE INDEX idx_expenses_company_date ON expenses(company_id, date);
CREATE INDEX idx_payroll_company_month ON monthly_payroll_runs(company_id, payroll_month);
CREATE INDEX idx_activity_company_created ON activity_logs(company_id, created_at DESC);
CREATE INDEX idx_activity_user ON activity_logs(user_name);
CREATE INDEX idx_activity_module ON activity_logs(module);
CREATE INDEX idx_audit_company ON audit_logs(company_id, timestamp DESC);
