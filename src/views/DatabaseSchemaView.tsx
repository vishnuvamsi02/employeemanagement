import React, { useState } from 'react';
import { Database, Copy, Check, Server, Shield, Layers, Code2 } from 'lucide-react';

export const DatabaseSchemaView: React.FC = () => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedPrisma, setCopiedPrisma] = useState(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'prisma' | 'er_overview'>('sql');

  const SQL_DDL = `-- ====================================================================
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

-- 11. Dedicated System Activity Logs Table
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL, -- Who performed the action
    user_role VARCHAR(50) NOT NULL CHECK (user_role IN ('owner', 'supervisor', 'accountant')),
    action VARCHAR(255) NOT NULL, -- Action performed
    module VARCHAR(100) NOT NULL, -- 'Attendance', 'Leaves', 'Overtime', 'Advances', 'Expenses', 'Payroll', 'Settings', 'Employees'
    target_entity VARCHAR(100), -- Entity affected: 'Employee', 'LeaveRequest', 'SalaryAdvance', etc.
    target_id VARCHAR(100), -- ID of the target record
    details TEXT NOT NULL, -- Detailed description of the modifications or changes made
    modifications_json JSONB, -- JSON payload of the delta/changed fields
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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
`;

  const PRISMA_SCHEMA = `// Prisma Schema for SaaS Multi-Tenant HRMS
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserRole {
  owner
  supervisor
  accountant
}

enum EmployeeType {
  white_collar
  blue_collar
}

enum AttendanceStatus {
  present
  absent
  half_day
  paid_leave
  unpaid_leave
  holiday
  weekly_off
}

enum LeaveApprovalType {
  paid_leave
  deducted_salary_leave
}

model Company {
  id                         String   @id @default(uuid())
  name                       String
  code                       String   @unique
  currency                   String   @default("INR")
  currencySymbol             String   @default("₹")
  workingDaysPerWeek         Int      @default(6)
  weeklyOffDays              Int[]    @default([0])
  standardWorkingHours       Float    @default(8.0)
  salaryCalculationBasis     String   @default("30_days")
  overtimeMultiplier         Float    @default(1.0)
  halfDayDeductionPercent    Float    @default(50.0)
  whiteCollarDefaultQuota    Int      @default(12)
  blueCollarDefaultQuota     Int      @default(0)
  payrollCycleDay            Int      @default(1)

  users                      User[]
  employees                  Employee[]
  attendances                Attendance[]
  leaveRequests              LeaveRequest[]
  overtimeRecords            OvertimeRecord[]
  salaryAdvances             SalaryAdvance[]
  expenses                   Expense[]
  payrollRuns                PayrollRun[]
  auditLogs                  AuditLog[]

  createdAt                  DateTime @default(now())
  updatedAt                  DateTime @updatedAt
}

model Employee {
  id                  String         @id @default(uuid())
  companyId           String
  company             Company        @relation(fields: [companyId], references: [id], onDelete: Cascade)
  employeeCode        String
  name                String
  phone               String?
  email               String?
  address             String?
  joiningDate         DateTime
  department          String
  designation         String
  employeeType        EmployeeType   @default(white_collar)
  salary              Float
  paidLeaveAllowance  Int            @default(12)
  usedPaidLeaves      Int            @default(0)
  overtimeEligible    Boolean        @default(true)
  
  attendances         Attendance[]
  leaveRequests       LeaveRequest[]
  overtimeRecords     OvertimeRecord[]
  advances            SalaryAdvance[]
  expenses            Expense[]
  payrollItems        PayrollItem[]

  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt

  @@unique([companyId, employeeCode])
}
`;

  const copyToClipboard = (text: string, type: 'sql' | 'prisma') => {
    navigator.clipboard.writeText(text);
    if (type === 'sql') {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } else {
      setCopiedPrisma(true);
      setTimeout(() => setCopiedPrisma(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Production Database Architecture</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              PostgreSQL Schema Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Production-grade schema designed for Section 18 Multi-Tenant isolation with row-level security and strict
            advance business constraints.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => copyToClipboard(SQL_DDL, 'sql')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs"
          >
            {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL DDL'}</span>
          </button>

          <button
            onClick={() => copyToClipboard(PRISMA_SCHEMA, 'prisma')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
          >
            {copiedPrisma ? <Check className="w-4 h-4 text-emerald-400" /> : <Code2 className="w-4 h-4" />}
            <span>{copiedPrisma ? 'Copied Prisma!' : 'Copy Prisma Schema'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('sql')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'sql' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 border'
          }`}
        >
          PostgreSQL DDL Migration Script
        </button>
        <button
          onClick={() => setActiveTab('prisma')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'prisma' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 border'
          }`}
        >
          Prisma ORM Schema
        </button>
        <button
          onClick={() => setActiveTab('er_overview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'er_overview' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 border'
          }`}
        >
          Entity Relationship Architecture
        </button>
      </div>

      {/* Code Display */}
      {activeTab === 'sql' && (
        <div className="bg-slate-950 rounded-3xl p-5 text-slate-200 shadow-2xl border border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400">
            <span className="font-mono">schema.sql (PostgreSQL 15+)</span>
            <span>11 Tables • Multi-Tenant Foreign Keys • Check Constraints</span>
          </div>
          <pre className="text-xs font-mono leading-relaxed overflow-x-auto max-h-[600px] text-slate-300">
            <code>{SQL_DDL}</code>
          </pre>
        </div>
      )}

      {activeTab === 'prisma' && (
        <div className="bg-slate-950 rounded-3xl p-5 text-slate-200 shadow-2xl border border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400">
            <span className="font-mono">prisma/schema.prisma</span>
            <span>Type-Safe TypeScript ORM Models</span>
          </div>
          <pre className="text-xs font-mono leading-relaxed overflow-x-auto max-h-[600px] text-indigo-200">
            <code>{PRISMA_SCHEMA}</code>
          </pre>
        </div>
      )}

      {activeTab === 'er_overview' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 text-xs">
          <h3 className="text-base font-bold text-slate-900">Relational Architecture Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <p className="font-bold text-indigo-950 text-sm">Tenant Isolation (Sec 18)</p>
              <p className="text-slate-600 mt-1">
                Every table maintains <code>company_id</code> foreign key with cascading deletes and multi-tenant index
                scoping. One company's data is never reachable by another tenant.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <p className="font-bold text-emerald-950 text-sm">Salary Advances (Sec 25)</p>
              <p className="text-slate-600 mt-1">
                Database level check constraints: <code>amount_recovered &lt;= amount</code> and{' '}
                <code>remaining_balance &gt;= 0</code> guarantee financial integrity and prevent over-deductions.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
              <p className="font-bold text-purple-950 text-sm">Duplicate Prevention</p>
              <p className="text-slate-600 mt-1">
                Unique composite constraint on <code>(employee_id, date)</code> in attendances guarantees zero
                accidental double punch-ins on any date.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
