import {
  CompanySettings,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  OvertimeRecord,
  SalaryAdvance,
  ExpenseRecord,
  AuditLog
} from '../types';

export const INITIAL_COMPANIES: CompanySettings[] = [
  {
    id: 'comp-1',
    name: 'Apex Precision Engineering Ltd.',
    code: 'APEX',
    currency: 'INR',
    currencySymbol: '₹',
    workingDaysPerWeek: 6,
    weeklyOffDays: [0], // Sunday
    standardWorkingHours: 8,
    salaryCalculationBasis: '30_days',
    overtimeMultiplier: 1.0,
    halfDayDeductionPercent: 50,
    whiteCollarDefaultLeaveQuota: 12,
    blueCollarDefaultLeaveQuota: 0,
    payrollCycleDay: 1,
    expenseCategories: [
      'Office Rent',
      'Electricity',
      'Internet',
      'Equipment & Tools',
      'Stationery & Supplies',
      'Travel & Fuel',
      'Food & Hospitality',
      'Plant Maintenance',
      'Employee Welfare',
      'Safety Gear'
    ]
  },
  {
    id: 'comp-2',
    name: 'Nexus Digital Technologies Pvt. Ltd.',
    code: 'NEXUS',
    currency: 'INR',
    currencySymbol: '₹',
    workingDaysPerWeek: 5,
    weeklyOffDays: [0, 6], // Sat & Sun
    standardWorkingHours: 8,
    salaryCalculationBasis: 'calendar_days',
    overtimeMultiplier: 1.5,
    halfDayDeductionPercent: 50,
    whiteCollarDefaultLeaveQuota: 18,
    blueCollarDefaultLeaveQuota: 5,
    payrollCycleDay: 1,
    expenseCategories: [
      'Cloud Hosting & AWS',
      'Software Licenses',
      'Office Supplies',
      'Team Travel',
      'Client Entertainment',
      'Broadband & Telecom'
    ]
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    companyId: 'comp-1',
    employeeCode: 'EMP-101',
    name: 'Rajesh Sharma',
    phone: '+91 98201 44521',
    email: 'rajesh.sharma@apexeng.in',
    address: 'B-402, Lotus Towers, Andheri East, Mumbai',
    joiningDate: '2022-03-15',
    department: 'Management',
    designation: 'General Operations Manager',
    employeeType: 'white_collar',
    salary: 65000,
    salaryFrequency: 'monthly',
    employmentStatus: 'active',
    paidLeaveAllowance: 15,
    usedPaidLeaves: 3,
    overtimeEligible: false,
    fatherName: 'Ramakant Sharma',
    gender: 'Male',
    dob: '1985-05-12',
    maritalStatus: 'Married',
    religion: 'Hindu',
    epfUan: '100902849120',
    languagesKnown: 'Hindi, English, Marathi',
    qualification: 'B.E. Mechanical & MBA Operations',
    experience: '14 Years in Plant & Production Management',
    bankDetails: {
      accountName: 'Rajesh Sharma',
      accountNumber: '50100428912341',
      bankName: 'HDFC Bank',
      ifscOrRouting: 'HDFC0000240'
    },
    notes: 'Key plant decision maker. Exemplary leadership.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-2',
    companyId: 'comp-1',
    employeeCode: 'EMP-102',
    name: 'Priya Nair',
    phone: '+91 97120 89123',
    email: 'priya.nair@apexeng.in',
    address: '703 Green Meadows, Powai, Mumbai',
    joiningDate: '2023-01-10',
    department: 'Finance & Accounts',
    designation: 'Senior Accountant',
    employeeType: 'white_collar',
    salary: 42000,
    salaryFrequency: 'monthly',
    employmentStatus: 'active',
    paidLeaveAllowance: 12,
    usedPaidLeaves: 1,
    overtimeEligible: false,
    fatherName: 'K. N. Nair',
    gender: 'Female',
    dob: '1992-08-24',
    maritalStatus: 'Single',
    religion: 'Hindu',
    epfUan: '101204891244',
    languagesKnown: 'English, Hindi, Malayalam',
    qualification: 'M.Com, CA Inter & Tally ERP Certified',
    experience: '7 Years Corporate & Factory Accounts',
    bankDetails: {
      accountName: 'Priya Nair',
      accountNumber: '91802003881239',
      bankName: 'ICICI Bank',
      ifscOrRouting: 'ICIC0001042'
    },
    notes: 'Handles bills, vouchers, petty cash, and tax compliance.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-3',
    companyId: 'comp-1',
    employeeCode: 'EMP-103',
    name: 'Vikram Patel',
    phone: '+91 98451 22901',
    email: 'vikram.patel@apexeng.in',
    address: '12 Shantiniketan Society, Thane West',
    joiningDate: '2021-07-01',
    department: 'Manufacturing',
    designation: 'Shop Floor Supervisor',
    employeeType: 'white_collar',
    salary: 38000,
    salaryFrequency: 'monthly',
    employmentStatus: 'active',
    paidLeaveAllowance: 12,
    usedPaidLeaves: 4,
    overtimeEligible: true,
    overtimeRateMultiplier: 1.0,
    fatherName: 'Harshad Patel',
    gender: 'Male',
    dob: '1988-11-03',
    maritalStatus: 'Married',
    religion: 'Hindu',
    epfUan: '100481920391',
    languagesKnown: 'Hindi, Gujarati, Marathi',
    qualification: 'Diploma in Mechanical Engineering',
    experience: '10 Years Shop Floor & Shift Supervision',
    bankDetails: {
      accountName: 'Vikram Patel',
      accountNumber: '320194812390',
      bankName: 'State Bank of India',
      ifscOrRouting: 'SBIN0004122'
    },
    notes: 'Direct supervisor overseeing blue-collar workers and attendance logging.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-4',
    companyId: 'comp-1',
    employeeCode: 'EMP-104',
    name: 'Amit Verma',
    phone: '+91 99302 77120',
    email: 'amit.verma@apexeng.in',
    address: 'Flat 101, Om Sai Residency, Navi Mumbai',
    joiningDate: '2023-06-15',
    department: 'Operations',
    designation: 'Operations Coordinator',
    employeeType: 'white_collar',
    salary: 30000, // Matching Section 21 example in spec doc!
    salaryFrequency: 'monthly',
    employmentStatus: 'active',
    paidLeaveAllowance: 12,
    usedPaidLeaves: 3,
    overtimeEligible: true,
    overtimeRateMultiplier: 1.0,
    fatherName: 'Omprakash Verma',
    gender: 'Male',
    dob: '1995-02-18',
    maritalStatus: 'Single',
    religion: 'Hindu',
    epfUan: '101482910482',
    languagesKnown: 'Hindi, English',
    qualification: 'B.Sc. Operations Management',
    experience: '4 Years Logistics & Dispatch Planning',
    bankDetails: {
      accountName: 'Amit Verma',
      accountNumber: '60293810293',
      bankName: 'Axis Bank',
      ifscOrRouting: 'UTIB0000678'
    },
    notes: 'Section 21 benchmark profile: ₹30k base, 8h/day, 10h overtime, 2 unpaid leaves, 1 half-day.',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-5',
    companyId: 'comp-1',
    employeeCode: 'EMP-105',
    name: 'Sneha Kulkarni',
    phone: '+91 98112 34509',
    email: 'sneha.kulkarni@apexeng.in',
    address: 'A-12, Green Acres, Vashi, Navi Mumbai',
    joiningDate: '2023-09-01',
    department: 'HR & Administration',
    designation: 'HR Executive',
    employeeType: 'white_collar',
    salary: 32000,
    salaryFrequency: 'monthly',
    employmentStatus: 'active',
    paidLeaveAllowance: 12,
    usedPaidLeaves: 0,
    overtimeEligible: false,
    fatherName: 'Anand Kulkarni',
    gender: 'Female',
    dob: '1996-07-30',
    maritalStatus: 'Single',
    religion: 'Hindu',
    epfUan: '101892019482',
    languagesKnown: 'English, Marathi, Hindi',
    qualification: 'MBA in Human Resources Management',
    experience: '3 Years Talent Acquisition & HR Operations',
    bankDetails: {
      accountName: 'Sneha Kulkarni',
      accountNumber: '44910293812',
      bankName: 'Kotak Mahindra Bank',
      ifscOrRouting: 'KKBK0001201'
    },
    notes: 'Handles onboardings, leaves filing, and employee files.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },
  // Blue-collar / Labour Workers (No paid leaves policy per Section 2 of doc)
  {
    id: 'emp-6',
    companyId: 'comp-1',
    employeeCode: 'EMP-201',
    name: 'Ramesh Yadav',
    phone: '+91 91234 56781',
    email: 'ramesh.yadav@apexeng.in',
    address: 'Room 14, Chawl No. 3, Turbhe Naka',
    joiningDate: '2022-11-10',
    department: 'Shop Floor',
    designation: 'Senior CNC Machine Operator',
    employeeType: 'blue_collar',
    salary: 24000,
    salaryFrequency: 'monthly',
    employmentStatus: 'active',
    paidLeaveAllowance: 0,
    usedPaidLeaves: 0,
    overtimeEligible: true,
    overtimeRateMultiplier: 1.0,
    fatherName: 'Shivpujan Yadav',
    gender: 'Male',
    dob: '1990-04-15',
    maritalStatus: 'Married',
    religion: 'Hindu',
    epfUan: '100381928374',
    languagesKnown: 'Hindi, Bhojpuri, Marathi',
    qualification: 'ITI Machinist Trade Certificate',
    experience: '8 Years Precision CNC Milling & Lathe',
    bankDetails: {
      accountName: 'Ramesh Yadav',
      accountNumber: '11029384756',
      bankName: 'Bank of Baroda',
      ifscOrRouting: 'BARB0VASHIX'
    },
    notes: 'Labour category: absences result in proportional daily wage deduction.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-7',
    companyId: 'comp-1',
    employeeCode: 'EMP-202',
    name: 'Manoj Kumar',
    phone: '+91 98765 43210',
    email: 'manoj.kumar@apexeng.in',
    address: 'Plot 45, Sector 19, Kopar Khairane',
    joiningDate: '2023-02-20',
    department: 'Fabrication',
    designation: 'Lead TIG/MIG Welder',
    employeeType: 'blue_collar',
    salary: 22000,
    salaryFrequency: 'monthly',
    employmentStatus: 'active',
    paidLeaveAllowance: 0,
    usedPaidLeaves: 0,
    overtimeEligible: true,
    overtimeRateMultiplier: 1.0,
    fatherName: 'Balram Kumar',
    gender: 'Male',
    dob: '1993-09-08',
    maritalStatus: 'Married',
    religion: 'Hindu',
    epfUan: '100918273645',
    languagesKnown: 'Hindi',
    qualification: 'ITI Welder Trade Certificate',
    experience: '6 Years TIG & MIG Fabrication',
    bankDetails: {
      accountName: 'Manoj Kumar',
      accountNumber: '20394857192',
      bankName: 'Punjab National Bank',
      ifscOrRouting: 'PUNB0192800'
    },
    notes: 'Skilled labour worker with high overtime record.',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-8',
    companyId: 'comp-1',
    employeeCode: 'EMP-203',
    name: 'Suresh Patil',
    phone: '+91 93201 12948',
    email: 'suresh.patil@apexeng.in',
    address: 'Shree Sai Krupa Chawl, Kalwa',
    joiningDate: '2023-08-01',
    department: 'Assembly',
    designation: 'Electro-Mechanical Assembler',
    employeeType: 'blue_collar',
    salary: 20000,
    salaryFrequency: 'monthly',
    employmentStatus: 'active',
    paidLeaveAllowance: 0,
    usedPaidLeaves: 0,
    overtimeEligible: true,
    overtimeRateMultiplier: 1.0,
    bankDetails: {
      accountName: 'Suresh Patil',
      accountNumber: '77281920391',
      bankName: 'Canara Bank',
      ifscOrRouting: 'CNRB0002931'
    },
    notes: 'Dependable assembly technician.',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-9',
    companyId: 'comp-1',
    employeeCode: 'EMP-204',
    name: 'Dinesh Bind',
    phone: '+91 97654 32189',
    email: 'dinesh.bind@apexeng.in',
    address: 'Near Railway Gate, Rabale',
    joiningDate: '2023-10-15',
    department: 'Warehouse',
    designation: 'Forklift & Inventory Handler',
    employeeType: 'blue_collar',
    salary: 19000,
    salaryFrequency: 'monthly',
    employmentStatus: 'active',
    paidLeaveAllowance: 0,
    usedPaidLeaves: 0,
    overtimeEligible: true,
    overtimeRateMultiplier: 1.0,
    bankDetails: {
      accountName: 'Dinesh Bind',
      accountNumber: '49281029381',
      bankName: 'Union Bank of India',
      ifscOrRouting: 'UBIN0539281'
    },
    notes: 'Handles material movement between raw stores and production.',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-10',
    companyId: 'comp-1',
    employeeCode: 'EMP-205',
    name: 'Raju Goud',
    phone: '+91 91122 33445',
    email: 'raju.goud@apexeng.in',
    address: 'Sector 3, Ghansoli',
    joiningDate: '2024-01-05',
    department: 'Maintenance',
    designation: 'Plant Electrician Helper',
    employeeType: 'blue_collar',
    salary: 18000,
    salaryFrequency: 'monthly',
    employmentStatus: 'probation',
    paidLeaveAllowance: 0,
    usedPaidLeaves: 0,
    overtimeEligible: true,
    overtimeRateMultiplier: 1.0,
    bankDetails: {
      accountName: 'Raju Goud',
      accountNumber: '89102938471',
      bankName: 'Bank of India',
      ifscOrRouting: 'BKID0001092'
    },
    notes: 'Currently on 3-month probation period.',
    avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80'
  }
];

// Helper to seed realistic attendance for current month
export function generateInitialAttendances(companyId: string, monthStr: string): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const daysInMonth = 30; // standard sample
  
  // Specific scenario for Amit Verma (EMP-104) matching Section 21 of document:
  // Present: 24 days, Paid Leave: 3 days, Unpaid Leave: 2 days, Half Day: 1 day.
  for (let day = 1; day <= daysInMonth; day++) {
    const dayPadded = day < 10 ? `0${day}` : `${day}`;
    const date = `${monthStr}-${dayPadded}`;
    const d = new Date(`${date}T00:00:00`);
    const isSunday = d.getDay() === 0;

    INITIAL_EMPLOYEES.filter(e => e.companyId === companyId).forEach(emp => {
      let status: AttendanceRecord['status'] = 'present';
      let workingHours = 8;
      let otHours = 0;

      if (isSunday) {
        status = 'weekly_off';
        workingHours = 0;
      } else if (emp.id === 'emp-4') {
        // Amit Verma custom schedule from Doc Section 21
        if (day === 5 || day === 6 || day === 7) {
          status = 'paid_leave';
          workingHours = 0;
        } else if (day === 12 || day === 13) {
          status = 'unpaid_leave';
          workingHours = 0;
        } else if (day === 18) {
          status = 'half_day';
          workingHours = 4;
        } else {
          status = 'present';
          workingHours = 8;
        }
      } else if (emp.employeeType === 'blue_collar' && (day === 11 || day === 23)) {
        // Labour absences
        if (emp.id === 'emp-6') {
          status = day === 11 ? 'absent' : 'present';
        }
      }

      records.push({
        id: `att-${emp.id}-${date}`,
        companyId,
        employeeId: emp.id,
        date,
        status,
        workingHours,
        overtimeHours: otHours,
        markedBy: 'Vikram Patel (Supervisor)',
        markedAt: `${date}T09:15:00Z`
      });
    });
  }

  return records;
}

export const INITIAL_OVERTIME: OvertimeRecord[] = [
  // Amit Verma (Section 21 example: 10 hours overtime total)
  {
    id: 'ot-1',
    companyId: 'comp-1',
    employeeId: 'emp-4',
    date: '2025-08-08',
    hours: 4,
    hourlyRate: 125, // 30,000 / 30 / 8 = 125
    totalAmount: 500,
    status: 'approved',
    recordedBy: 'Vikram Patel (Supervisor)',
    approvedBy: 'Rajesh Sharma (Owner)',
    notes: 'Urgent production dispatch coordination'
  },
  {
    id: 'ot-2',
    companyId: 'comp-1',
    employeeId: 'emp-4',
    date: '2025-08-16',
    hours: 6,
    hourlyRate: 125,
    totalAmount: 750,
    status: 'approved',
    recordedBy: 'Vikram Patel (Supervisor)',
    approvedBy: 'Rajesh Sharma (Owner)',
    notes: 'Weekend equipment overhaul monitoring'
  },
  // Labour workers overtime
  {
    id: 'ot-3',
    companyId: 'comp-1',
    employeeId: 'emp-6', // Ramesh Yadav
    date: '2025-08-14',
    hours: 5,
    hourlyRate: 100, // 24,000 / 30 / 8 = 100
    totalAmount: 500,
    status: 'approved',
    recordedBy: 'Vikram Patel (Supervisor)',
    approvedBy: 'Rajesh Sharma (Owner)',
    notes: 'Night shift CNC machining backlog'
  },
  {
    id: 'ot-4',
    companyId: 'comp-1',
    employeeId: 'emp-7', // Manoj Kumar
    date: '2025-08-20',
    hours: 4,
    hourlyRate: 91.67,
    totalAmount: 366.68,
    status: 'pending',
    recordedBy: 'Vikram Patel (Supervisor)',
    notes: 'Structural frame welding rush order'
  }
];

// Salary Advances matching Section 25
export const INITIAL_ADVANCES: SalaryAdvance[] = [
  {
    id: 'adv-1',
    companyId: 'comp-1',
    advanceCode: 'ADV-2025-001',
    employeeId: 'emp-4', // Amit Verma
    advanceDate: '2025-08-02',
    amount: 10000,
    reason: 'Family medical emergency',
    paymentMethod: 'Bank Transfer',
    amountRecovered: 2000,
    remainingBalance: 8000,
    expectedSettlementDate: '2025-12-31',
    recoveryMode: 'monthly_installment',
    monthlyInstallmentAmount: 2000,
    status: 'active',
    approvedBy: 'Rajesh Sharma (Owner)',
    notes: 'Approved for ₹2,000 monthly payroll deduction until ₹0.',
    recoveryHistory: [
      {
        id: 'rec-1',
        date: '2025-07-31',
        payrollMonth: '2025-07',
        amount: 2000
      }
    ]
  },
  {
    id: 'adv-2',
    companyId: 'comp-1',
    advanceCode: 'ADV-2025-002',
    employeeId: 'emp-6', // Ramesh Yadav
    advanceDate: '2025-08-05',
    amount: 5000,
    reason: 'Home renovation and festival expenses',
    paymentMethod: 'Cash',
    amountRecovered: 0,
    remainingBalance: 5000,
    expectedSettlementDate: '2025-08-31',
    recoveryMode: 'full_next_month',
    monthlyInstallmentAmount: 5000,
    status: 'active',
    approvedBy: 'Rajesh Sharma (Owner)',
    notes: 'Full deduction in August payroll as agreed.',
    recoveryHistory: []
  },
  {
    id: 'adv-3',
    companyId: 'comp-1',
    advanceCode: 'ADV-2025-003',
    employeeId: 'emp-7', // Manoj Kumar
    advanceDate: '2025-08-22',
    amount: 6000,
    reason: 'Child school admission fees',
    paymentMethod: 'UPI',
    amountRecovered: 0,
    remainingBalance: 6000,
    expectedSettlementDate: '2025-11-30',
    recoveryMode: 'monthly_installment',
    monthlyInstallmentAmount: 2000,
    status: 'pending',
    notes: 'Awaiting Owner review and accountant disbursal.',
    recoveryHistory: []
  },
  {
    id: 'adv-4',
    companyId: 'comp-1',
    advanceCode: 'ADV-2025-004',
    employeeId: 'emp-8', // Suresh Patil
    advanceDate: '2025-06-10',
    amount: 3000,
    reason: 'Bike repair and transit costs',
    paymentMethod: 'Cash',
    amountRecovered: 3000,
    remainingBalance: 0,
    expectedSettlementDate: '2025-07-31',
    recoveryMode: 'full_next_month',
    status: 'settled',
    approvedBy: 'Rajesh Sharma (Owner)',
    notes: 'Fully settled in July payroll.',
    recoveryHistory: [
      {
        id: 'rec-2',
        date: '2025-07-31',
        payrollMonth: '2025-07',
        amount: 3000
      }
    ]
  }
];

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'lev-1',
    companyId: 'comp-1',
    employeeId: 'emp-5', // Sneha Kulkarni
    startDate: '2025-08-28',
    endDate: '2025-08-29',
    daysCount: 2,
    reason: 'Attending family wedding ceremony in Pune',
    status: 'pending',
    notes: 'Has 12 available paid leaves. Ready for approval.'
  },
  {
    id: 'lev-2',
    companyId: 'comp-1',
    employeeId: 'emp-7', // Manoj Kumar (Labour)
    startDate: '2025-08-25',
    endDate: '2025-08-26',
    daysCount: 2,
    reason: 'Personal urgent work in village',
    status: 'pending',
    notes: 'Labour worker: approver can pick Deducted Salary Leave.'
  },
  {
    id: 'lev-3',
    companyId: 'comp-1',
    employeeId: 'emp-1', // Rajesh Sharma
    startDate: '2025-08-10',
    endDate: '2025-08-11',
    daysCount: 2,
    reason: 'Annual doctor checkup',
    status: 'approved',
    approvalType: 'paid_leave',
    approvedBy: 'Rajesh Sharma (Owner)',
    approvedAt: '2025-08-08T10:00:00Z',
    notes: 'Sanctioned under annual paid leave balance.'
  }
];

export const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp-1',
    companyId: 'comp-1',
    expenseCode: 'EXP-1001',
    date: '2025-08-04',
    title: 'Factory High-Tension Electricity Bill',
    amount: 18450,
    category: 'Electricity',
    description: 'MSEDCL Industrial power tariff for July billing cycle',
    paidBy: 'Company Account',
    expenseType: 'office',
    paymentMethod: 'Bank Transfer',
    receiptName: 'msedcl_invoice_aug2025.pdf',
    status: 'approved',
    approvedBy: 'Priya Nair (Accountant)',
    notes: 'Verified against meter reading.'
  },
  {
    id: 'exp-2',
    companyId: 'comp-1',
    expenseCode: 'EXP-1002',
    date: '2025-08-07',
    title: 'CNC Lathe Hydraulic Fluid & Coolant',
    amount: 7800,
    category: 'Plant Maintenance',
    description: 'Scheduled fluid replacement for Machines 3 & 4',
    paidBy: 'Priya Nair (Accountant)',
    expenseType: 'office',
    vendor: 'Castrol Lubricants Agency',
    paymentMethod: 'Petty Cash',
    receiptName: 'coolant_receipt.jpg',
    status: 'approved',
    approvedBy: 'Rajesh Sharma (Owner)'
  },
  {
    id: 'exp-3',
    companyId: 'comp-1',
    expenseCode: 'EXP-1003',
    date: '2025-08-12',
    title: 'Client Hospitality & Supplier Dinner',
    amount: 3450,
    category: 'Food & Hospitality',
    description: 'Dinner with steel raw material suppliers from Pune',
    paidBy: 'Employee Reimbursement',
    expenseType: 'employee',
    employeeId: 'emp-4', // Amit Verma
    paymentMethod: 'Cash',
    receiptName: 'restaurant_bill.jpg',
    status: 'pending',
    notes: 'Reimbursement requested by Amit Verma'
  },
  {
    id: 'exp-4',
    companyId: 'comp-1',
    expenseCode: 'EXP-1004',
    date: '2025-08-15',
    title: 'Safety Helmets, Boots & Gloves Kit (x10)',
    amount: 11200,
    category: 'Safety Gear',
    description: 'Mandatory PPE kit renewal for shop floor technicians',
    paidBy: 'Company Account',
    expenseType: 'office',
    vendor: 'Karam Safety Solutions',
    paymentMethod: 'Company Card',
    receiptName: 'safety_ppe_invoice.pdf',
    status: 'approved',
    approvedBy: 'Priya Nair (Accountant)'
  },
  {
    id: 'exp-5',
    companyId: 'comp-1',
    expenseCode: 'EXP-1005',
    date: '2025-08-18',
    title: 'Site Visit Fuel & Toll Reimbursement',
    amount: 2150,
    category: 'Travel & Fuel',
    description: 'Travel to client assembly plant at Chakan, Pune',
    paidBy: 'Employee Reimbursement',
    expenseType: 'employee',
    employeeId: 'emp-3', // Vikram Patel
    paymentMethod: 'Cash',
    receiptName: 'fastag_fuel_receipt.pdf',
    status: 'approved',
    approvedBy: 'Priya Nair (Accountant)'
  },
  {
    id: 'exp-6',
    companyId: 'comp-1',
    expenseCode: 'EXP-1006',
    date: '2025-08-21',
    title: 'High-Speed Industrial Fiber Internet',
    amount: 3200,
    category: 'Internet',
    description: 'Tata Tele Business broadband monthly charge',
    paidBy: 'Company Account',
    expenseType: 'office',
    paymentMethod: 'Bank Transfer',
    receiptName: 'tata_tele_aug.pdf',
    status: 'approved',
    approvedBy: 'Priya Nair (Accountant)'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    companyId: 'comp-1',
    timestamp: '2025-08-25T09:30:00Z',
    userName: 'Vikram Patel (Supervisor)',
    userRole: 'supervisor',
    action: 'Logged Daily Attendance',
    module: 'Attendance',
    targetEntity: 'Attendance',
    details: 'Marked 9 present, 1 half-day, 1 paid leave for 2025-08-25.'
  },
  {
    id: 'log-2',
    companyId: 'comp-1',
    timestamp: '2025-08-24T14:15:00Z',
    userName: 'Rajesh Sharma (Owner)',
    userRole: 'owner',
    action: 'Sanctioned Salary Advance',
    module: 'Advances',
    targetEntity: 'SalaryAdvance',
    targetId: 'adv-1',
    details: 'Sanctioned ₹10,000 advance for Amit Verma (ADV-2025-001). Recovery Mode: monthly_installment, Installment: ₹2,000/mo.'
  },
  {
    id: 'log-3',
    companyId: 'comp-1',
    timestamp: '2025-08-22T11:05:00Z',
    userName: 'Priya Nair (Accountant)',
    userRole: 'accountant',
    action: 'Approved Expense Voucher',
    module: 'Expenses',
    targetEntity: 'ExpenseRecord',
    targetId: 'exp-1',
    details: 'Approved ₹18,450 commercial electricity tariff voucher for workshop facility.'
  },
  {
    id: 'log-4',
    companyId: 'comp-1',
    timestamp: '2025-08-20T16:45:00Z',
    userName: 'Vikram Patel (Supervisor)',
    userRole: 'supervisor',
    action: 'Recorded Overtime Shift',
    module: 'Overtime',
    targetEntity: 'OvertimeRecord',
    targetId: 'ot-1',
    details: 'Logged 4.0h overtime (1.0x) for Manoj Kumar on evening fabrication run.'
  },
  {
    id: 'log-5',
    companyId: 'comp-1',
    timestamp: '2025-08-18T10:15:00Z',
    userName: 'Vikram Patel (Supervisor)',
    userRole: 'supervisor',
    action: 'Approved Leave Request',
    module: 'Leaves',
    targetEntity: 'LeaveRequest',
    targetId: 'lev-1',
    details: 'Approved 2 day(s) leave for Rahul Sharma as "PAID LEAVE (Quota Deduction)". Remarks: Production coverage arranged.'
  },
  {
    id: 'log-6',
    companyId: 'comp-1',
    timestamp: '2025-08-15T08:00:00Z',
    userName: 'Rajesh Sharma (Owner)',
    userRole: 'owner',
    action: 'Updated Company Settings',
    module: 'Settings',
    targetEntity: 'CompanySettings',
    targetId: 'comp-1',
    details: 'Configured payroll calculation basis to 30_days, overtime multiplier 1.0x, half-day deduction 50%.'
  }
];
