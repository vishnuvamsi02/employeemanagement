import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateEmployeePayroll } from '../utils/payrollCalculator';
import { formatCurrency, formatDate, getMonthName } from '../utils/formatters';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  DollarSign,
  Clock,
  Banknote,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    employees,
    attendances,
    overtimes,
    advances,
    expenses,
    currentCompany,
    activePayrollMonth,
    setActivePayrollMonth,
    currentRole,
    canViewSalary
  } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<
    'payroll' | 'attendance' | 'overtime' | 'advances' | 'expenses'
  >(() => (canViewSalary ? 'payroll' : 'attendance'));

  // Ensure supervisor never lingers on a restricted tab
  React.useEffect(() => {
    if (!canViewSalary && (activeReportTab === 'payroll' || activeReportTab === 'advances' || activeReportTab === 'expenses')) {
      setActiveReportTab('attendance');
    }
  }, [canViewSalary, activeReportTab]);

  const sym = currentCompany.currencySymbol;

  // Compute payroll items for the active month
  const payrollItems = employees.map(emp =>
    calculateEmployeePayroll(emp, currentCompany, activePayrollMonth, attendances, overtimes, advances)
  );

  // CSV Export utility
  const exportToCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${activePayrollMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPayroll = () => {
    const headers = [
      'Employee Code',
      'Employee Name',
      'Department',
      'Designation',
      'Category',
      'Base Monthly Salary',
      'Overtime Hours',
      'Overtime Earnings',
      'Absent Days',
      'Absent Deductions',
      'Unpaid Leaves',
      'Unpaid Deductions',
      'Half Days',
      'Half Day Deductions',
      'Advance Recovery',
      'Final Net Payable'
    ];
    const rows = payrollItems.map(item => [
      item.employeeCode,
      item.employeeName,
      item.department,
      item.designation,
      item.employeeType,
      item.baseSalary,
      item.overtimeHours,
      item.overtimeEarnings,
      item.absentDays,
      item.absentDeductions,
      item.unpaidLeaveDays,
      item.unpaidLeaveDeductions,
      item.halfDays,
      item.halfDayDeductions,
      item.advanceRecovery,
      item.finalPayableSalary
    ]);
    exportToCsv('Payroll_Register_Report', headers, rows);
  };

  const handleExportAttendance = () => {
    const headers = ['Employee Code', 'Employee Name', 'Present Days', 'Absent Days', 'Half Days', 'Paid Leaves', 'Unpaid Leaves'];
    const rows = employees.map(emp => {
      const empAtt = attendances.filter(a => a.employeeId === emp.id && a.date.startsWith(activePayrollMonth));
      return [
        emp.employeeCode,
        emp.name,
        empAtt.filter(a => a.status === 'present').length,
        empAtt.filter(a => a.status === 'absent').length,
        empAtt.filter(a => a.status === 'half_day').length,
        empAtt.filter(a => a.status === 'paid_leave').length,
        empAtt.filter(a => a.status === 'unpaid_leave').length
      ];
    });
    exportToCsv('Monthly_Attendance_Summary', headers, rows);
  };

  const handleExportAdvances = () => {
    const headers = ['Advance Code', 'Employee Name', 'Advance Date', 'Total Sanctioned', 'Amount Recovered', 'Remaining Balance', 'Recovery Mode', 'Status'];
    const rows = advances.map(adv => {
      const emp = employees.find(e => e.id === adv.employeeId);
      return [
        adv.advanceCode,
        emp?.name || 'Unknown',
        adv.advanceDate,
        adv.amount,
        adv.amountRecovered,
        adv.remainingBalance,
        adv.recoveryMode,
        adv.status
      ];
    });
    exportToCsv('Salary_Advances_Ledger', headers, rows);
  };

  const handleExportExpenses = () => {
    const headers = ['Expense Code', 'Title', 'Date', 'Type', 'Category', 'Amount', 'Payment Method', 'Paid By', 'Status'];
    const rows = expenses.map(exp => [
      exp.expenseCode,
      exp.title,
      exp.date,
      exp.expenseType,
      exp.category,
      exp.amount,
      exp.paymentMethod,
      exp.paidBy,
      exp.status
    ]);
    exportToCsv('Company_Expenses_Ledger', headers, rows);
  };

  const handleExportOvertime = () => {
    const monthOts = overtimes.filter(o => o.date.startsWith(activePayrollMonth));
    if (canViewSalary) {
      const headers = ['Employee Code', 'Employee Name', 'Department', 'Shift Date', 'OT Hours', 'Multiplier', 'Hourly Rate', 'Total Amount', 'Notes', 'Status'];
      const rows = monthOts.map(ot => {
        const emp = employees.find(e => e.id === ot.employeeId);
        return [
          emp?.employeeCode || '',
          emp?.name || 'Unknown',
          emp?.department || '',
          ot.date,
          ot.hours,
          `${ot.multiplier || emp?.overtimeRateMultiplier || 1.0}x`,
          ot.hourlyRate,
          ot.totalAmount,
          ot.notes || '',
          ot.status
        ];
      });
      exportToCsv('Monthly_Overtime_Ledger', headers, rows);
    } else {
      const headers = ['Employee Code', 'Employee Name', 'Department', 'Shift Date', 'OT Hours', 'Multiplier', 'Notes', 'Status'];
      const rows = monthOts.map(ot => {
        const emp = employees.find(e => e.id === ot.employeeId);
        return [
          emp?.employeeCode || '',
          emp?.name || 'Unknown',
          emp?.department || '',
          ot.date,
          ot.hours,
          `${ot.multiplier || emp?.overtimeRateMultiplier || 1.0}x`,
          ot.notes || '',
          ot.status
        ];
      });
      exportToCsv('Monthly_Overtime_Shift_Logs', headers, rows);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {canViewSalary ? 'Executive Reports & Analytics' : 'Attendance & Overtime Reports'}
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              {canViewSalary ? 'Section 15 Spec' : 'Operational Scope'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {canViewSalary
              ? 'Export monthly attendance rolls, salary sheets, advance recovery ledgers, and expense audits to CSV/PDF.'
              : 'Export monthly workforce attendance summaries and overtime shift logs to CSV/Excel.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <input
              type="month"
              value={activePayrollMonth}
              onChange={e => setActivePayrollMonth(e.target.value)}
              className="bg-transparent focus:outline-none text-slate-900 font-bold"
            />
          </div>

          <button
            onClick={() => {
              if (activeReportTab === 'payroll' && canViewSalary) handleExportPayroll();
              else if (activeReportTab === 'attendance') handleExportAttendance();
              else if (activeReportTab === 'overtime') handleExportOvertime();
              else if (activeReportTab === 'advances' && canViewSalary) handleExportAdvances();
              else if (activeReportTab === 'expenses' && canViewSalary) handleExportExpenses();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export to CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          ...(canViewSalary ? [{ id: 'payroll', label: 'Payroll Register Report', icon: DollarSign }] : []),
          { id: 'attendance', label: 'Attendance Summary', icon: Calendar },
          { id: 'overtime', label: 'Overtime Logs', icon: Clock },
          ...(canViewSalary
            ? [
                { id: 'advances', label: 'Salary Advances Ledger', icon: Banknote },
                { id: 'expenses', label: 'Expenses Audit Report', icon: Receipt }
              ]
            : [])
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeReportTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Payroll Register (Hidden from Supervisor) */}
      {canViewSalary && activeReportTab === 'payroll' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-900">
            <span>Monthly Payroll Register ({getMonthName(activePayrollMonth)})</span>
            <span className="text-slate-500 font-normal">All figures in {sym}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Base Salary</th>
                  <th className="py-3 px-4 text-emerald-700">Overtime</th>
                  <th className="py-3 px-4 text-rose-700">Absent Cuts</th>
                  <th className="py-3 px-4 text-amber-700">Half-Day</th>
                  <th className="py-3 px-4 text-indigo-700">Advance Rec.</th>
                  <th className="py-3 px-4 font-extrabold text-slate-900">Net Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payrollItems.map(item => (
                  <tr key={item.employeeId} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-slate-500">{item.employeeCode}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{item.employeeName}</td>
                    <td className="py-3 px-4">{formatCurrency(item.baseSalary, sym)}</td>
                    <td className="py-3 px-4 text-emerald-700">+{formatCurrency(item.overtimeEarnings, sym)}</td>
                    <td className="py-3 px-4 text-rose-700">-{formatCurrency(item.absentDeductions + item.unpaidLeaveDeductions, sym)}</td>
                    <td className="py-3 px-4 text-amber-700">-{formatCurrency(item.halfDayDeductions, sym)}</td>
                    <td className="py-3 px-4 font-semibold text-indigo-700">-{formatCurrency(item.advanceRecovery, sym)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(item.finalPayableSalary, sym)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance Summary */}
      {activeReportTab === 'attendance' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-emerald-700">Present Days</th>
                  <th className="py-3 px-4 text-rose-700">Absent Days</th>
                  <th className="py-3 px-4 text-amber-700">Half Days</th>
                  <th className="py-3 px-4 text-sky-700">Paid Leaves</th>
                  <th className="py-3 px-4 text-purple-700">Unpaid Leaves</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map(emp => {
                  const empAtt = attendances.filter(a => a.employeeId === emp.id && a.date.startsWith(activePayrollMonth));
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{emp.name}</td>
                      <td className="py-3 px-4 text-slate-500">{emp.employeeType === 'white_collar' ? 'White-Collar' : 'Labour'}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-700">{empAtt.filter(a => a.status === 'present').length}</td>
                      <td className="py-3 px-4 font-semibold text-rose-700">{empAtt.filter(a => a.status === 'absent').length}</td>
                      <td className="py-3 px-4 font-semibold text-amber-700">{empAtt.filter(a => a.status === 'half_day').length}</td>
                      <td className="py-3 px-4 font-semibold text-sky-700">{empAtt.filter(a => a.status === 'paid_leave').length}</td>
                      <td className="py-3 px-4 font-semibold text-purple-700">{empAtt.filter(a => a.status === 'unpaid_leave').length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Overtime Logs (Role-Sensitive Salary/Compensation Display) */}
      {activeReportTab === 'overtime' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-900">
            <span>Monthly Overtime Shift Logs ({getMonthName(activePayrollMonth)})</span>
            <span className="text-slate-500 font-normal">
              {canViewSalary ? `Payable figures in ${sym}` : 'Floor Shift Hours & Status'}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Shift Date</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-amber-700">OT Hours</th>
                  <th className="py-3 px-4">Multiplier</th>
                  {canViewSalary && <th className="py-3 px-4 text-slate-600">Hourly Rate</th>}
                  {canViewSalary && <th className="py-3 px-4 text-emerald-700">Total Compensation</th>}
                  <th className="py-3 px-4">Work / Reason</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overtimes
                  .filter(o => o.date.startsWith(activePayrollMonth))
                  .map(ot => {
                    const emp = employees.find(e => e.id === ot.employeeId);
                    return (
                      <tr key={ot.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-slate-600">{formatDate(ot.date)}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{emp?.name || 'Unknown'}</td>
                        <td className="py-3 px-4 text-slate-500">{emp?.department || '-'}</td>
                        <td className="py-3 px-4 font-bold text-amber-700">{ot.hours} hrs</td>
                        <td className="py-3 px-4 font-medium">{ot.multiplier || emp?.overtimeRateMultiplier || 1.0}x</td>
                        {canViewSalary && (
                          <td className="py-3 px-4 text-slate-600">{formatCurrency(ot.hourlyRate, sym)}/hr</td>
                        )}
                        {canViewSalary && (
                          <td className="py-3 px-4 font-bold text-emerald-700">+{formatCurrency(ot.totalAmount, sym)}</td>
                        )}
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{ot.notes || 'Overtime Shift'}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              ot.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : ot.status === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {ot.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Salary Advances (Hidden from Supervisor) */}
      {canViewSalary && activeReportTab === 'advances' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Sanctioned</th>
                  <th className="py-3 px-4 text-emerald-700">Recovered</th>
                  <th className="py-3 px-4 font-bold text-amber-800">Remaining Balance</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {advances.map(adv => {
                  const emp = employees.find(e => e.id === adv.employeeId);
                  return (
                    <tr key={adv.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{adv.advanceCode}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{emp?.name}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(adv.advanceDate)}</td>
                      <td className="py-3 px-4 font-bold">{formatCurrency(adv.amount, sym)}</td>
                      <td className="py-3 px-4 text-emerald-700 font-semibold">{formatCurrency(adv.amountRecovered, sym)}</td>
                      <td className="py-3 px-4 font-bold text-amber-800">{formatCurrency(adv.remainingBalance, sym)}</td>
                      <td className="py-3 px-4 text-slate-600">{adv.recoveryMode}</td>
                      <td className="py-3 px-4 font-bold uppercase text-[10px] text-indigo-700">{adv.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Expenses (Hidden from Supervisor) */}
      {canViewSalary && activeReportTab === 'expenses' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Voucher</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Paid By</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">{exp.title}</td>
                    <td className="py-3 px-4 text-slate-600">{formatDate(exp.date)}</td>
                    <td className="py-3 px-4 uppercase text-[10px] font-bold text-slate-500">{exp.expenseType}</td>
                    <td className="py-3 px-4 font-medium">{exp.category}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(exp.amount, sym)}</td>
                    <td className="py-3 px-4 text-slate-600">{exp.paidBy}</td>
                    <td className="py-3 px-4 font-bold uppercase text-[10px] text-emerald-700">{exp.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
