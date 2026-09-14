import {
  CompanySettings,
  Employee,
  AttendanceRecord,
  OvertimeRecord,
  SalaryAdvance,
  PayrollItemCalculation
} from '../types';

export function calculateEmployeePayroll(
  employee: Employee,
  settings: CompanySettings,
  payrollMonth: string, // YYYY-MM
  attendances: AttendanceRecord[],
  overtimes: OvertimeRecord[],
  advances: SalaryAdvance[],
  manualAdjustments?: { bonuses?: number; allowances?: number; otherDeductions?: number; notes?: string }
): PayrollItemCalculation {
  const [yearStr, monthStr] = payrollMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  // 1. Determine calculation basis days
  let calculationBasisDays = 30; // default standard
  const calendarDays = new Date(year, month, 0).getDate();

  if (settings.salaryCalculationBasis === 'calendar_days') {
    calculationBasisDays = calendarDays;
  } else if (settings.salaryCalculationBasis === 'working_days') {
    // Count days excluding configured weekly offs
    let workDaysCount = 0;
    for (let day = 1; day <= calendarDays; day++) {
      const dayOfWeek = new Date(year, month - 1, day).getDay();
      if (!settings.weeklyOffDays.includes(dayOfWeek)) {
        workDaysCount++;
      }
    }
    calculationBasisDays = workDaysCount > 0 ? workDaysCount : 26;
  } else {
    calculationBasisDays = 30;
  }

  // 2. Base salary & rates
  const baseSalary = employee.salary || 0;
  const dailySalary = calculationBasisDays > 0 ? baseSalary / calculationBasisDays : 0;
  const hourlyRate = settings.standardWorkingHours > 0 
    ? (dailySalary / settings.standardWorkingHours) * (settings.overtimeMultiplier || 1.0)
    : 0;

  // 3. Filter employee attendance in this month
  const monthAttendances = attendances.filter(a => {
    return a.employeeId === employee.id && a.date.startsWith(payrollMonth);
  });

  let presentDays = 0;
  let halfDays = 0;
  let paidLeaveDays = 0;
  let unpaidLeaveDays = 0;
  let absentDays = 0;
  let weeklyOffDays = 0;
  let holidayDays = 0;

  monthAttendances.forEach(a => {
    switch (a.status) {
      case 'present':
        presentDays++;
        break;
      case 'half_day':
        halfDays++;
        break;
      case 'paid_leave':
        paidLeaveDays++;
        break;
      case 'unpaid_leave':
        unpaidLeaveDays++;
        break;
      case 'absent':
        absentDays++;
        break;
      case 'weekly_off':
        weeklyOffDays++;
        break;
      case 'holiday':
        holidayDays++;
        break;
    }
  });

  // 4. Overtime hours (approved only, or recorded)
  const monthOvertimes = overtimes.filter(o => {
    return o.employeeId === employee.id && o.date.startsWith(payrollMonth) && o.status !== 'rejected';
  });

  const overtimeHours = monthOvertimes.reduce((acc, curr) => acc + (curr.hours || 0), 0);
  const overtimeEarnings = Math.round(overtimeHours * hourlyRate * 100) / 100;

  // 5. Deductions
  // Blue-collar workers: if any unpaid leave or absence, direct daily deduction
  const absentDeductions = Math.round(absentDays * dailySalary * 100) / 100;
  const unpaidLeaveDeductions = Math.round(unpaidLeaveDays * dailySalary * 100) / 100;
  const halfDayDeductionFactor = (settings.halfDayDeductionPercent || 50) / 100;
  const halfDayDeductions = Math.round(halfDays * dailySalary * halfDayDeductionFactor * 100) / 100;

  // 6. Salary Advance Recovery
  // Check all active advances for this employee
  let advanceRecovery = 0;
  const employeeAdvances = advances.filter(a => a.employeeId === employee.id && a.status === 'active' && a.remainingBalance > 0);

  employeeAdvances.forEach(adv => {
    let eligibleRecovery = 0;
    if (adv.recoveryMode === 'full_next_month') {
      eligibleRecovery = adv.remainingBalance;
    } else if (adv.recoveryMode === 'monthly_installment' && adv.monthlyInstallmentAmount) {
      eligibleRecovery = Math.min(adv.remainingBalance, adv.monthlyInstallmentAmount);
    } else {
      eligibleRecovery = Math.min(adv.remainingBalance, adv.monthlyInstallmentAmount || adv.remainingBalance);
    }
    advanceRecovery += eligibleRecovery;
  });

  // 7. Manual Additions & Other Deductions
  const bonuses = manualAdjustments?.bonuses || 0;
  const allowances = manualAdjustments?.allowances || 0;
  const otherDeductions = manualAdjustments?.otherDeductions || 0;

  // 8. Final Net Payable
  const totalEarnings = baseSalary + overtimeEarnings + bonuses + allowances;
  const totalDeductions = absentDeductions + unpaidLeaveDeductions + halfDayDeductions + advanceRecovery + otherDeductions;
  const finalPayableSalary = Math.max(0, Math.round((totalEarnings - totalDeductions) * 100) / 100);

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    employeeCode: employee.employeeCode,
    designation: employee.designation,
    department: employee.department,
    employeeType: employee.employeeType,
    baseSalary,
    calculationBasisDays,
    dailySalary: Math.round(dailySalary * 100) / 100,
    hourlyRate: Math.round(hourlyRate * 100) / 100,
    presentDays,
    halfDays,
    paidLeaveDays,
    unpaidLeaveDays,
    absentDays,
    weeklyOffDays,
    holidayDays,
    overtimeHours,
    overtimeEarnings,
    bonuses,
    allowances,
    absentDeductions,
    unpaidLeaveDeductions,
    halfDayDeductions,
    advanceRecovery,
    otherDeductions,
    finalPayableSalary,
    notes: manualAdjustments?.notes
  };
}
