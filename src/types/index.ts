export type UserRole = 'owner' | 'supervisor' | 'accountant';

export type EmployeeType = 'white_collar' | 'blue_collar';

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'half_day'
  | 'paid_leave'
  | 'unpaid_leave'
  | 'holiday'
  | 'weekly_off';

export type SalaryCalculationBasis = '30_days' | 'calendar_days' | 'working_days';

export interface CompanySettings {
  id: string;
  name: string;
  code: string;
  currency: string;
  currencySymbol: string;
  workingDaysPerWeek: number; // e.g. 6 or 5
  weeklyOffDays: number[]; // 0 for Sunday, 6 for Saturday
  standardWorkingHours: number; // e.g. 8
  salaryCalculationBasis: SalaryCalculationBasis;
  overtimeMultiplier: number; // e.g. 1.0, 1.25, 1.5, 2.0
  halfDayDeductionPercent: number; // e.g. 50%
  whiteCollarDefaultLeaveQuota: number; // e.g. 12
  blueCollarDefaultLeaveQuota: number; // e.g. 0
  payrollCycleDay: number; // 1st or end of month
  expenseCategories: string[];
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  ifscOrRouting: string;
}

export interface Employee {
  id: string;
  companyId: string;
  employeeCode: string; // e.g. EMP-101
  name: string;
  phone: string;
  email: string;
  address: string;
  joiningDate: string; // YYYY-MM-DD
  department: string;
  designation: string;
  employeeType: EmployeeType;
  salary: number; // Monthly base salary
  salaryFrequency: 'monthly' | 'daily';
  employmentStatus: 'active' | 'probation' | 'inactive';
  paidLeaveAllowance: number;
  usedPaidLeaves: number;
  overtimeEligible: boolean;
  overtimeRateMultiplier?: number;
  // Personal & Statutory Details (from specification)
  fatherName?: string;
  gender?: string;
  dob?: string; // Date of Birth YYYY-MM-DD
  maritalStatus?: string;
  religion?: string;
  epfUan?: string; // Existing EPF UAN No
  languagesKnown?: string;
  qualification?: string;
  experience?: string;
  bankDetails: BankDetails;
  notes?: string;
  avatarUrl?: string;
}

export interface AttendanceRecord {
  id: string;
  companyId: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  workingHours: number;
  overtimeHours: number;
  notes?: string;
  markedBy: string;
  markedAt: string;
}

export interface LeaveRequest {
  id: string;
  companyId: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvalType?: 'paid_leave' | 'deducted_salary_leave' | null;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export interface OvertimeRecord {
  id: string;
  companyId: string;
  employeeId: string;
  date: string;
  hours: number;
  hourlyRate: number;
  totalAmount: number;
  multiplier?: number;
  status: 'pending' | 'approved' | 'rejected';
  recordedBy: string;
  approvedBy?: string;
  notes?: string;
}

export interface AdvanceRecoveryItem {
  id: string;
  date: string;
  payrollMonth: string;
  amount: number;
}

export interface SalaryAdvance {
  id: string;
  companyId: string;
  advanceCode: string; // e.g. ADV-2025-01
  employeeId: string;
  advanceDate: string;
  amount: number;
  reason: string;
  paymentMethod: 'Bank Transfer' | 'Cash' | 'Cheque' | 'UPI';
  amountRecovered: number;
  remainingBalance: number;
  expectedSettlementDate: string;
  recoveryMode: 'full_next_month' | 'monthly_installment' | 'custom_amount';
  monthlyInstallmentAmount?: number;
  status: 'pending' | 'active' | 'settled' | 'rejected';
  approvedBy?: string;
  notes?: string;
  recoveryHistory: AdvanceRecoveryItem[];
}

export interface ExpenseRecord {
  id: string;
  companyId: string;
  expenseCode: string;
  date: string;
  title: string;
  amount: number;
  category: string;
  description: string;
  paidBy: string;
  expenseType: 'office' | 'employee';
  employeeId?: string;
  vendor?: string;
  paymentMethod: 'Company Card' | 'Bank Transfer' | 'Cash' | 'Petty Cash';
  receiptUrl?: string;
  receiptName?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  notes?: string;
}

export interface PayrollItemCalculation {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  designation: string;
  department: string;
  employeeType: EmployeeType;
  baseSalary: number;
  calculationBasisDays: number;
  dailySalary: number;
  hourlyRate: number;
  
  // Attendance metrics in month
  presentDays: number;
  halfDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  absentDays: number;
  weeklyOffDays: number;
  holidayDays: number;
  
  // Overtime
  overtimeHours: number;
  overtimeEarnings: number;
  
  // Additions
  bonuses: number;
  allowances: number;
  
  // Deductions
  absentDeductions: number;
  unpaidLeaveDeductions: number;
  halfDayDeductions: number;
  advanceRecovery: number;
  otherDeductions: number;
  
  // Final
  finalPayableSalary: number;
  
  notes?: string;
}

export interface MonthlyPayrollRun {
  id: string;
  companyId: string;
  payrollMonth: string; // YYYY-MM
  status: 'draft' | 'finalized';
  generatedAt: string;
  finalizedAt?: string;
  finalizedBy?: string;
  totalBaseSalary: number;
  totalOvertime: number;
  totalAdditions: number;
  totalDeductions: number;
  totalNetPayable: number;
  items: PayrollItemCalculation[];
}

export interface AuditLog {
  id: string;
  companyId: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: 'Attendance' | 'Payroll' | 'Leaves' | 'Overtime' | 'Advances' | 'Expenses' | 'Settings' | 'Employees';
  targetEntity?: string;
  targetId?: string;
  details: string;
  changes?: Record<string, any>;
}

export interface NotificationItem {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  linkTab?: string;
}
