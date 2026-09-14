import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CompanySettings,
  UserRole,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  OvertimeRecord,
  SalaryAdvance,
  ExpenseRecord,
  MonthlyPayrollRun,
  PayrollItemCalculation,
  AuditLog,
  NotificationItem,
  AdvanceRecoveryItem
} from '../types';
import {
  INITIAL_COMPANIES,
  INITIAL_EMPLOYEES,
  INITIAL_OVERTIME,
  INITIAL_ADVANCES,
  INITIAL_LEAVES,
  INITIAL_EXPENSES,
  INITIAL_AUDIT_LOGS,
  generateInitialAttendances
} from '../data/mockData';

export interface CurrentUser {
  name: string;
  email: string;
  role: UserRole;
}

interface AppContextType {
  // Authentication & Role
  isAuthenticated: boolean;
  currentUser: CurrentUser | null;
  login: (role: UserRole, email?: string) => void;
  logout: () => void;
  currentRole: UserRole;
  setRole: (role: UserRole) => void;

  // Permissions
  canViewSalary: boolean;
  canApproveLeave: boolean;
  canApproveOvertime: boolean;
  canApproveAdvance: boolean;
  canApproveExpense: boolean;

  // Tenant / Company
  currentCompany: CompanySettings;
  companies: CompanySettings[];
  switchCompany: (companyId: string) => void;
  updateCompanySettings: (settings: CompanySettings) => void;
  
  // Navigation & Mobile state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedEmployeeId: string | null;
  setSelectedEmployeeId: (id: string | null) => void;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;

  // Data
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id' | 'employeeCode'>) => void;
  updateEmployee: (emp: Employee) => void;
  deleteEmployee: (id: string) => void;

  attendances: AttendanceRecord[];
  markAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  bulkMarkAttendance: (records: Array<Omit<AttendanceRecord, 'id'>>) => void;

  leaves: LeaveRequest[];
  requestLeave: (leave: Omit<LeaveRequest, 'id'>) => void;
  approveLeave: (leaveId: string, approvalType: 'paid_leave' | 'deducted_salary_leave', notes?: string) => void;
  rejectLeave: (leaveId: string, notes?: string) => void;

  overtimes: OvertimeRecord[];
  recordOvertime: (ot: Omit<OvertimeRecord, 'id'>) => void;
  approveOvertime: (otId: string) => void;
  rejectOvertime: (otId: string) => void;

  advances: SalaryAdvance[];
  recordAdvance: (adv: {
    employeeId: string;
    advanceDate: string;
    amount: number;
    reason: string;
    paymentMethod: SalaryAdvance['paymentMethod'];
    recoveryMode: SalaryAdvance['recoveryMode'];
    monthlyInstallmentAmount?: number;
    expectedSettlementDate: string;
    notes?: string;
  }) => void;
  approveAdvance: (advId: string) => void;
  rejectAdvance: (advId: string) => void;
  settleAdvanceAmount: (advId: string, amount: number, payrollMonth?: string) => void;

  expenses: ExpenseRecord[];
  addExpense: (exp: Omit<ExpenseRecord, 'id' | 'expenseCode'>) => void;
  approveExpense: (expId: string) => void;
  rejectExpense: (expId: string) => void;

  // Payroll
  activePayrollMonth: string;
  setActivePayrollMonth: (month: string) => void;
  payrollRuns: MonthlyPayrollRun[];
  finalizePayroll: (month: string, items: PayrollItemCalculation[]) => void;

  // Logs & Notifications
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Reset
  resetAllDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'OMNISTAFF_SAAS_STATE_V2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem(`${LOCAL_STORAGE_KEY}_auth`);
    return savedAuth === 'true';
  });

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    const savedUser = localStorage.getItem(`${LOCAL_STORAGE_KEY}_user`);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const savedUser = localStorage.getItem(`${LOCAL_STORAGE_KEY}_user`);
    if (savedUser) {
      try {
        return JSON.parse(savedUser).role;
      } catch {}
    }
    return 'owner';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [activePayrollMonth, setActivePayrollMonth] = useState<string>('2025-08');

  // Load companies
  const [companies, setCompanies] = useState<CompanySettings[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_companies`);
    const list = saved ? JSON.parse(saved) : INITIAL_COMPANIES;
    // Always force INR for Indian users
    return list.map((c: CompanySettings) => ({ ...c, currency: 'INR', currencySymbol: '₹' }));
  });

  const [currentCompanyId, setCurrentCompanyId] = useState<string>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_curr_company`);
    return saved || 'comp-1';
  });

  const rawCurrentCompany = companies.find(c => c.id === currentCompanyId) || companies[0];
  const currentCompany: CompanySettings = {
    ...rawCurrentCompany,
    currency: 'INR',
    currencySymbol: '₹'
  };

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_employees`);
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [attendances, setAttendances] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_attendances`);
    return saved ? JSON.parse(saved) : generateInitialAttendances('comp-1', '2025-08');
  });

  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_leaves`);
    return saved ? JSON.parse(saved) : INITIAL_LEAVES;
  });

  const [overtimes, setOvertimes] = useState<OvertimeRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_overtimes`);
    return saved ? JSON.parse(saved) : INITIAL_OVERTIME;
  });

  const [advances, setAdvances] = useState<SalaryAdvance[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_advances`);
    return saved ? JSON.parse(saved) : INITIAL_ADVANCES;
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_expenses`);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [payrollRuns, setPayrollRuns] = useState<MonthlyPayrollRun[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_payroll_runs`);
    return saved ? JSON.parse(saved) : [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_audit_logs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      timestamp: '10 minutes ago',
      title: 'Leave Request Pending',
      message: 'Sneha Kulkarni requested 2 days Casual Leave. Review decision required.',
      type: 'warning',
      read: false,
      linkTab: 'approvals'
    },
    {
      id: 'notif-2',
      timestamp: '1 hour ago',
      title: 'Salary Advance Request',
      message: 'Manoj Kumar requested ₹6,000 salary advance for school admission.',
      type: 'info',
      read: false,
      linkTab: 'advances'
    },
    {
      id: 'notif-3',
      timestamp: '2 hours ago',
      title: 'Expense Claim Filed',
      message: 'Amit Verma submitted ₹3,450 for client hospitality reimbursement.',
      type: 'alert',
      read: false,
      linkTab: 'expenses'
    }
  ]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_auth`, String(isAuthenticated));
    if (currentUser) {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_user`);
    }
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_companies`, JSON.stringify(companies));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_curr_company`, currentCompanyId);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_employees`, JSON.stringify(employees));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_attendances`, JSON.stringify(attendances));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_leaves`, JSON.stringify(leaves));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_overtimes`, JSON.stringify(overtimes));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_advances`, JSON.stringify(advances));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_expenses`, JSON.stringify(expenses));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_payroll_runs`, JSON.stringify(payrollRuns));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_audit_logs`, JSON.stringify(auditLogs));
  }, [isAuthenticated, currentUser, companies, currentCompanyId, employees, attendances, leaves, overtimes, advances, expenses, payrollRuns, auditLogs]);

  // Login handler
  const login = (role: UserRole, email?: string) => {
    const roleProfiles: Record<UserRole, { name: string; email: string }> = {
      owner: { name: 'Rajesh Sharma', email: email || 'owner@apexeng.in' },
      supervisor: { name: 'Vikram Patel', email: email || 'supervisor@apexeng.in' },
      accountant: { name: 'Priya Nair', email: email || 'accountant@apexeng.in' }
    };
    const profile = roleProfiles[role];
    const user: CurrentUser = {
      name: profile.name,
      email: profile.email,
      role
    };
    setCurrentUser(user);
    setCurrentRole(role);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
    logAction('User Logged In', 'Settings', `${profile.name} (${role.toUpperCase()}) logged in`);
  };

  // Logout handler
  const logout = () => {
    logAction('User Logged Out', 'Settings', `${currentUser?.name || currentRole} logged out`);
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_auth`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_user`);
    setActiveTab('dashboard');
  };

  const setRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (currentUser) {
      const updatedUser = { ...currentUser, role: newRole };
      setCurrentUser(updatedUser);
    }
    // If current tab is restricted, redirect to dashboard
    setActiveTab('dashboard');
    logAction('Switched Active Role', 'Settings', `Switched active preview role to ${newRole}`);
  };

  // Role Permissions
  // 1. Salary information must NOT be visible to Supervisor
  const canViewSalary = currentRole !== 'supervisor';
  // 2. Leave Requests: Supervisor & Owner only (Accountant has NO access)
  const canApproveLeave = currentRole === 'owner' || currentRole === 'supervisor';
  // 3. Overtime Requests: Supervisor & Owner only (Accountant has NO access)
  const canApproveOvertime = currentRole === 'owner' || currentRole === 'supervisor';
  // 4. Advance Requests: Owner & Accountant only (Supervisor has NO access)
  const canApproveAdvance = currentRole === 'owner' || currentRole === 'accountant';
  // 5. Expenses: Owner & Accountant
  const canApproveExpense = currentRole === 'owner' || currentRole === 'accountant';

  const logAction = (
    action: string,
    module: AuditLog['module'],
    details: string,
    targetEntity?: string,
    targetId?: string,
    changes?: Record<string, any>
  ) => {
    const roleNames: Record<UserRole, string> = {
      owner: 'Rajesh Sharma (Owner)',
      supervisor: 'Vikram Patel (Supervisor)',
      accountant: 'Priya Nair (Accountant)'
    };
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      companyId: currentCompany.id,
      timestamp: new Date().toISOString(),
      userName: currentUser?.name ? `${currentUser.name} (${currentRole})` : roleNames[currentRole],
      userRole: currentRole,
      action,
      module,
      targetEntity,
      targetId,
      details,
      changes
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const switchCompany = (companyId: string) => {
    setCurrentCompanyId(companyId);
    logAction('Switched Workspace', 'Settings', `Switched active company workspace to ${companyId}`, 'Company', companyId);
  };

  const updateCompanySettings = (updated: CompanySettings) => {
    const forced = { ...updated, currency: 'INR', currencySymbol: '₹' };
    setCompanies(prev => prev.map(c => (c.id === forced.id ? forced : c)));
    logAction(
      'Updated Company Settings',
      'Settings',
      `Configured payroll & overtime rules for ${forced.name}. Basis=${forced.salaryCalculationBasis}, StandardHours=${forced.standardWorkingHours}h, OT Multiplier=${forced.overtimeMultiplier}x, HalfDayCut=${forced.halfDayDeductionPercent}%`,
      'CompanySettings',
      forced.id,
      {
        salaryCalculationBasis: forced.salaryCalculationBasis,
        standardWorkingHours: forced.standardWorkingHours,
        overtimeMultiplier: forced.overtimeMultiplier,
        halfDayDeductionPercent: forced.halfDayDeductionPercent
      }
    );
  };

  // Employees
  const addEmployee = (empData: Omit<Employee, 'id' | 'employeeCode'>) => {
    const companyEmployees = employees.filter(e => e.companyId === currentCompany.id);
    const prefix = empData.employeeType === 'white_collar' ? 'EMP-1' : 'EMP-2';
    const nextNum = 100 + companyEmployees.length + 1;
    const newEmp: Employee = {
      ...empData,
      id: `emp-${Date.now()}`,
      employeeCode: `${prefix}${nextNum.toString().slice(-2)}`,
      companyId: currentCompany.id
    };
    setEmployees(prev => [newEmp, ...prev]);
    logAction(
      'Created Employee Profile',
      'Employees',
      `Added employee ${newEmp.name} (${newEmp.employeeCode}) - Designation: ${newEmp.designation}, Dept: ${newEmp.department}, Category: ${newEmp.employeeType === 'white_collar' ? 'White-Collar' : 'Labour Worker'}, Monthly Base: ₹${newEmp.salary}`,
      'Employee',
      newEmp.id,
      {
        name: newEmp.name,
        code: newEmp.employeeCode,
        designation: newEmp.designation,
        department: newEmp.department,
        salary: newEmp.salary
      }
    );
  };

  const updateEmployee = (updated: Employee) => {
    setEmployees(prev => prev.map(e => (e.id === updated.id ? updated : e)));
    logAction(
      'Modified Employee',
      'Employees',
      `Updated records for ${updated.name} (${updated.employeeCode}) - Designation: ${updated.designation}, Dept: ${updated.department}, Status: ${updated.employmentStatus}`,
      'Employee',
      updated.id,
      {
        name: updated.name,
        designation: updated.designation,
        status: updated.employmentStatus
      }
    );
  };

  const deleteEmployee = (id: string) => {
    const emp = employees.find(e => e.id === id);
    setEmployees(prev => prev.filter(e => e.id !== id));
    logAction('Removed Employee', 'Employees', `Archived employee profile ${emp?.name || id} (${emp?.employeeCode || id})`, 'Employee', id);
  };

  // Attendance
  const markAttendance = (record: Omit<AttendanceRecord, 'id'>) => {
    setAttendances(prev => {
      const filtered = prev.filter(a => !(a.employeeId === record.employeeId && a.date === record.date));
      return [...filtered, { ...record, id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` }];
    });
    const emp = employees.find(e => e.id === record.employeeId);
    logAction(
      'Marked Attendance',
      'Attendance',
      `Marked ${record.status.toUpperCase()} for ${emp?.name || record.employeeId} on ${record.date} (Shift Hours: ${record.workingHours || 8}h, OT: ${record.overtimeHours || 0}h)`,
      'Attendance',
      record.employeeId,
      { status: record.status, date: record.date }
    );
  };

  const bulkMarkAttendance = (records: Array<Omit<AttendanceRecord, 'id'>>) => {
    setAttendances(prev => {
      const keysToReplace = new Set(records.map(r => `${r.employeeId}_${r.date}`));
      const retained = prev.filter(a => !keysToReplace.has(`${a.employeeId}_${a.date}`));
      const newItems = records.map((r, i) => ({
        ...r,
        id: `att-${Date.now()}-${i}`
      }));
      return [...retained, ...newItems];
    });
    logAction('Bulk Attendance Marked', 'Attendance', `Rapid morning attendance marked for ${records.length} employees on ${records[0]?.date || 'active shift'}`, 'Attendance');
  };

  // Leaves
  const requestLeave = (leaveData: Omit<LeaveRequest, 'id'>) => {
    const newLeave: LeaveRequest = {
      ...leaveData,
      id: `lev-${Date.now()}`
    };
    setLeaves(prev => [newLeave, ...prev]);
    const emp = employees.find(e => e.id === leaveData.employeeId);
    logAction(
      'Submitted Leave Request',
      'Leaves',
      `${emp?.name} requested ${leaveData.daysCount} days leave (${leaveData.startDate} to ${leaveData.endDate}). Reason: "${leaveData.reason}"`,
      'LeaveRequest',
      newLeave.id,
      { daysCount: leaveData.daysCount, startDate: leaveData.startDate, endDate: leaveData.endDate }
    );
  };

  const approveLeave = (leaveId: string, approvalType: 'paid_leave' | 'deducted_salary_leave', notes?: string) => {
    if (!canApproveLeave) return;

    setLeaves(prev =>
      prev.map(l => {
        if (l.id === leaveId) {
          return {
            ...l,
            status: 'approved',
            approvalType,
            approvedBy: currentRole === 'supervisor' ? 'Vikram Patel (Supervisor)' : 'Rajesh Sharma (Owner)',
            approvedAt: new Date().toISOString(),
            notes: notes || l.notes
          };
        }
        return l;
      })
    );

    const targetLeave = leaves.find(l => l.id === leaveId);
    if (targetLeave && approvalType === 'paid_leave') {
      setEmployees(prev =>
        prev.map(e => {
          if (e.id === targetLeave.employeeId) {
            return {
              ...e,
              usedPaidLeaves: (e.usedPaidLeaves || 0) + targetLeave.daysCount
            };
          }
          return e;
        })
      );
    }

    const emp = employees.find(e => e.id === targetLeave?.employeeId);
    logAction(
      'Approved Leave Request',
      'Leaves',
      `Approved ${targetLeave?.daysCount || 1} day(s) leave for ${emp?.name} as "${approvalType === 'paid_leave' ? 'PAID LEAVE (Quota Deduction)' : 'DEDUCTED SALARY LEAVE (Salary Cut)'}". Remarks: ${notes || 'Approved'}`,
      'LeaveRequest',
      leaveId,
      { approvalType, notes }
    );
  };

  const rejectLeave = (leaveId: string, notes?: string) => {
    if (!canApproveLeave) return;

    setLeaves(prev =>
      prev.map(l => (l.id === leaveId ? { ...l, status: 'rejected', notes: notes || l.notes } : l))
    );
    const target = leaves.find(l => l.id === leaveId);
    const emp = employees.find(e => e.id === target?.employeeId);
    logAction('Rejected Leave', 'Leaves', `Declined leave request for ${emp?.name}. Reason: ${notes || 'Unspecified'}`, 'LeaveRequest', leaveId);
  };

  // Overtime
  const recordOvertime = (otData: Omit<OvertimeRecord, 'id'>) => {
    const newOt: OvertimeRecord = {
      ...otData,
      id: `ot-${Date.now()}`
    };
    setOvertimes(prev => [newOt, ...prev]);
    const emp = employees.find(e => e.id === otData.employeeId);
    const mult = otData.multiplier || emp?.overtimeRateMultiplier || 1.0;
    logAction(
      'Recorded Overtime',
      'Overtime',
      `Logged ${otData.hours}h overtime (${mult}x) for ${emp?.name} on ${otData.date}. Shift description: ${otData.notes || 'Factory shift'}`,
      'OvertimeRecord',
      newOt.id,
      { hours: otData.hours, multiplier: mult }
    );
  };

  const approveOvertime = (otId: string) => {
    if (!canApproveOvertime) return;

    setOvertimes(prev =>
      prev.map(o => (o.id === otId ? { ...o, status: 'approved', approvedBy: currentRole === 'supervisor' ? 'Vikram Patel (Supervisor)' : 'Rajesh Sharma (Owner)' } : o))
    );
    const ot = overtimes.find(o => o.id === otId);
    const emp = employees.find(e => e.id === ot?.employeeId);
    logAction('Approved Overtime', 'Overtime', `Approved ${ot?.hours}h overtime shift for ${emp?.name} on ${ot?.date}`, 'OvertimeRecord', otId, { status: 'approved' });
  };

  const rejectOvertime = (otId: string) => {
    if (!canApproveOvertime) return;

    setOvertimes(prev => prev.map(o => (o.id === otId ? { ...o, status: 'rejected' } : o)));
    logAction('Rejected Overtime', 'Overtime', `Rejected overtime record of ${overtimes.find(o => o.id === otId)?.hours || 0}h`, 'OvertimeRecord', otId, { status: 'rejected' });
  };

  // Advances (Section 25)
  const recordAdvance = (advData: {
    employeeId: string;
    advanceDate: string;
    amount: number;
    reason: string;
    paymentMethod: SalaryAdvance['paymentMethod'];
    recoveryMode: SalaryAdvance['recoveryMode'];
    monthlyInstallmentAmount?: number;
    expectedSettlementDate: string;
    notes?: string;
  }) => {
    const advCount = advances.length + 1;
    const newAdv: SalaryAdvance = {
      id: `adv-${Date.now()}`,
      companyId: currentCompany.id,
      advanceCode: `ADV-${new Date().getFullYear()}-${advCount.toString().padStart(3, '0')}`,
      employeeId: advData.employeeId,
      advanceDate: advData.advanceDate,
      amount: advData.amount,
      reason: advData.reason,
      paymentMethod: advData.paymentMethod,
      amountRecovered: 0,
      remainingBalance: advData.amount,
      expectedSettlementDate: advData.expectedSettlementDate,
      recoveryMode: advData.recoveryMode,
      monthlyInstallmentAmount: advData.monthlyInstallmentAmount || (advData.recoveryMode === 'full_next_month' ? advData.amount : 0),
      status: currentRole === 'owner' ? 'active' : 'pending',
      approvedBy: currentRole === 'owner' ? 'Rajesh Sharma (Owner)' : undefined,
      notes: advData.notes,
      recoveryHistory: []
    };
    setAdvances(prev => [newAdv, ...prev]);
    const emp = employees.find(e => e.id === advData.employeeId);
    logAction(
      'Salary Advance Created',
      'Advances',
      `Sanctioned advance ${newAdv.advanceCode} of ₹${advData.amount} for ${emp?.name}. Recovery Mode: ${advData.recoveryMode}, Monthly Installment: ₹${newAdv.monthlyInstallmentAmount}`,
      'SalaryAdvance',
      newAdv.id,
      { amount: advData.amount, recoveryMode: advData.recoveryMode }
    );
  };

  const approveAdvance = (advId: string) => {
    if (!canApproveAdvance) return;

    setAdvances(prev =>
      prev.map(a =>
        a.id === advId
          ? { ...a, status: 'active', approvedBy: currentRole === 'accountant' ? 'Priya Nair (Accountant)' : 'Rajesh Sharma (Owner)' }
          : a
      )
    );
    const adv = advances.find(a => a.id === advId);
    const emp = employees.find(e => e.id === adv?.employeeId);
    logAction('Approved Salary Advance', 'Advances', `Approved ₹${adv?.amount || 0} advance (${adv?.advanceCode}) for ${emp?.name}`, 'SalaryAdvance', advId, { status: 'active' });
  };

  const rejectAdvance = (advId: string) => {
    if (!canApproveAdvance) return;

    setAdvances(prev => prev.map(a => (a.id === advId ? { ...a, status: 'rejected' } : a)));
    const adv = advances.find(a => a.id === advId);
    logAction('Rejected Salary Advance', 'Advances', `Declined advance request ${adv?.advanceCode || advId}`, 'SalaryAdvance', advId, { status: 'rejected' });
  };

  const settleAdvanceAmount = (advId: string, deductionAmount: number, payrollMonth?: string) => {
    let finalRem = 0;
    setAdvances(prev =>
      prev.map(a => {
        if (a.id === advId) {
          const actualDeduction = Math.min(a.remainingBalance, deductionAmount);
          const newRecovered = a.amountRecovered + actualDeduction;
          const newRemaining = Math.max(0, a.amount - newRecovered);
          finalRem = newRemaining;
          const newHistory: AdvanceRecoveryItem = {
            id: `rec-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            payrollMonth: payrollMonth || activePayrollMonth,
            amount: actualDeduction
          };
          return {
            ...a,
            amountRecovered: newRecovered,
            remainingBalance: newRemaining,
            status: newRemaining === 0 ? 'settled' : 'active',
            recoveryHistory: [newHistory, ...a.recoveryHistory]
          };
        }
        return a;
      })
    );
    const adv = advances.find(a => a.id === advId);
    const emp = employees.find(e => e.id === adv?.employeeId);
    logAction(
      'Advance Settlement Recovered',
      'Advances',
      `Recovered ₹${deductionAmount} against advance ${adv?.advanceCode || advId} for ${emp?.name || 'employee'}. Remaining balance: ₹${finalRem}`,
      'SalaryAdvance',
      advId,
      { recovered: deductionAmount, remainingBalance: finalRem }
    );
  };

  // Expenses
  const addExpense = (expData: Omit<ExpenseRecord, 'id' | 'expenseCode'>) => {
    const code = `EXP-${1000 + expenses.length + 1}`;
    const newExp: ExpenseRecord = {
      ...expData,
      id: `exp-${Date.now()}`,
      expenseCode: code,
      companyId: currentCompany.id,
      status: currentRole === 'owner' ? 'approved' : 'pending',
      approvedBy: currentRole === 'owner' ? 'Rajesh Sharma (Owner)' : undefined
    };
    setExpenses(prev => [newExp, ...prev]);
    logAction(
      'Submitted Expense Voucher',
      'Expenses',
      `Submitted voucher ${code}: "${expData.title}" for ₹${expData.amount} (${expData.category}) by ${expData.paidBy}`,
      'ExpenseRecord',
      newExp.id,
      { amount: expData.amount, category: expData.category }
    );
  };

  const approveExpense = (expId: string) => {
    if (!canApproveExpense) return;

    setExpenses(prev =>
      prev.map(e =>
        e.id === expId
          ? { ...e, status: 'approved', approvedBy: currentRole === 'accountant' ? 'Priya Nair (Accountant)' : 'Rajesh Sharma (Owner)' }
          : e
      )
    );
    const exp = expenses.find(e => e.id === expId);
    logAction('Approved Expense Claim', 'Expenses', `Approved reimbursement ${exp?.expenseCode} ("${exp?.title}") for ₹${exp?.amount || 0}`, 'ExpenseRecord', expId, { status: 'approved' });
  };

  const rejectExpense = (expId: string) => {
    if (!canApproveExpense) return;

    setExpenses(prev => prev.map(e => (e.id === expId ? { ...e, status: 'rejected' } : e)));
    const exp = expenses.find(e => e.id === expId);
    logAction('Rejected Expense Voucher', 'Expenses', `Declined reimbursement claim ${exp?.expenseCode || expId} ("${exp?.title || ''}")`, 'ExpenseRecord', expId, { status: 'rejected' });
  };

  // Payroll Finalization
  const finalizePayroll = (month: string, items: PayrollItemCalculation[]) => {
    const totalBase = items.reduce((acc, i) => acc + i.baseSalary, 0);
    const totalOT = items.reduce((acc, i) => acc + i.overtimeEarnings, 0);
    const totalAdd = items.reduce((acc, i) => acc + i.bonuses + i.allowances, 0);
    const totalDed = items.reduce((acc, i) => acc + i.absentDeductions + i.unpaidLeaveDeductions + i.halfDayDeductions + i.advanceRecovery + i.otherDeductions, 0);
    const totalNet = items.reduce((acc, i) => acc + i.finalPayableSalary, 0);

    const newPayrollRun: MonthlyPayrollRun = {
      id: `payrun-${month}-${Date.now()}`,
      companyId: currentCompany.id,
      payrollMonth: month,
      status: 'finalized',
      generatedAt: new Date().toISOString(),
      finalizedAt: new Date().toISOString(),
      finalizedBy: 'Rajesh Sharma (Owner)',
      totalBaseSalary: totalBase,
      totalOvertime: totalOT,
      totalAdditions: totalAdd,
      totalDeductions: totalDed,
      totalNetPayable: totalNet,
      items
    };

    items.forEach(item => {
      if (item.advanceRecovery > 0) {
        const empAdvances = advances.filter(a => a.employeeId === item.employeeId && a.status === 'active' && a.remainingBalance > 0);
        let deductionPool = item.advanceRecovery;
        for (const adv of empAdvances) {
          if (deductionPool <= 0) break;
          const toDeduct = Math.min(adv.remainingBalance, deductionPool);
          settleAdvanceAmount(adv.id, toDeduct, month);
          deductionPool -= toDeduct;
        }
      }
    });

    setPayrollRuns(prev => [newPayrollRun, ...prev.filter(r => !(r.companyId === currentCompany.id && r.payrollMonth === month))]);
    logAction(
      'Finalized Monthly Payroll',
      'Payroll',
      `Locked and processed payroll for ${month}. Total Staff: ${items.length}, Base Salaries: ₹${totalBase}, Overtime: +₹${totalOT}, Deductions: -₹${totalDed}, Net Disbursed: ₹${totalNet}`,
      'MonthlyPayrollRun',
      newPayrollRun.id,
      { totalNetPayable: totalNet, staffCount: items.length }
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const resetAllDemoData = () => {
    localStorage.clear();
    setCompanies(INITIAL_COMPANIES.map(c => ({ ...c, currency: 'INR', currencySymbol: '₹' })));
    setCurrentCompanyId('comp-1');
    setEmployees(INITIAL_EMPLOYEES);
    setAttendances(generateInitialAttendances('comp-1', '2025-08'));
    setLeaves(INITIAL_LEAVES);
    setOvertimes(INITIAL_OVERTIME);
    setAdvances(INITIAL_ADVANCES);
    setExpenses(INITIAL_EXPENSES);
    setPayrollRuns([]);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setActivePayrollMonth('2025-08');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        logout,
        currentRole,
        setRole,
        canViewSalary,
        canApproveLeave,
        canApproveOvertime,
        canApproveAdvance,
        canApproveExpense,
        currentCompany,
        companies,
        switchCompany,
        updateCompanySettings,
        activeTab,
        setActiveTab,
        selectedEmployeeId,
        setSelectedEmployeeId,
        isMobileNavOpen,
        setIsMobileNavOpen,
        employees: employees.filter(e => e.companyId === currentCompany.id),
        addEmployee,
        updateEmployee,
        deleteEmployee,
        attendances: attendances.filter(a => a.companyId === currentCompany.id),
        markAttendance,
        bulkMarkAttendance,
        leaves: leaves.filter(l => l.companyId === currentCompany.id),
        requestLeave,
        approveLeave,
        rejectLeave,
        overtimes: overtimes.filter(o => o.companyId === currentCompany.id),
        recordOvertime,
        approveOvertime,
        rejectOvertime,
        advances: advances.filter(a => a.companyId === currentCompany.id),
        recordAdvance,
        approveAdvance,
        rejectAdvance,
        settleAdvanceAmount,
        expenses: expenses.filter(e => e.companyId === currentCompany.id),
        addExpense,
        approveExpense,
        rejectExpense,
        activePayrollMonth,
        setActivePayrollMonth,
        payrollRuns: payrollRuns.filter(p => p.companyId === currentCompany.id),
        finalizePayroll,
        auditLogs: auditLogs.filter(l => l.companyId === currentCompany.id),
        notifications,
        markNotificationAsRead,
        clearNotifications,
        resetAllDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
