import React from 'react';
import { useApp } from '../context/AppContext';
import { MetricCard } from '../components/common/MetricCard';
import { formatCurrency, formatDate } from '../utils/formatters';
import { calculateEmployeePayroll } from '../utils/payrollCalculator';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Banknote,
  DollarSign,
  Receipt,
  FileCheck2,
  CalendarDays,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentRole,
    currentCompany,
    employees,
    attendances,
    overtimes,
    advances,
    expenses,
    leaves,
    activePayrollMonth,
    setActiveTab,
    setSelectedEmployeeId,
    canApproveLeave,
    canApproveOvertime,
    canApproveAdvance,
    canApproveExpense,
    canViewSalary
  } = useApp();

  const sym = currentCompany.currencySymbol;

  // Compute today's date for attendance stats
  const availableDates: string[] = Array.from(new Set(attendances.map(a => a.date))).sort().reverse();
  const sampleToday: string = availableDates[0] || '2025-08-25';

  const todayAttendances = attendances.filter(a => a.date === sampleToday);
  const presentToday = todayAttendances.filter(a => a.status === 'present').length;
  const absentToday = todayAttendances.filter(a => a.status === 'absent').length;
  const halfDayToday = todayAttendances.filter(a => a.status === 'half_day').length;
  const leaveToday = todayAttendances.filter(a => a.status === 'paid_leave' || a.status === 'unpaid_leave').length;

  // Month Overtime
  const monthOvertimes = overtimes.filter(o => o.date.startsWith(activePayrollMonth) && o.status === 'approved');
  const totalOtHours = monthOvertimes.reduce((acc, o) => acc + o.hours, 0);
  const totalOtCost = monthOvertimes.reduce((acc, o) => acc + o.totalAmount, 0);

  // Month Expenses
  const monthExpenses = expenses.filter(e => e.date.startsWith(activePayrollMonth) && e.status === 'approved');
  const officeExpenses = monthExpenses.filter(e => e.expenseType === 'office').reduce((acc, e) => acc + e.amount, 0);
  const employeeExpenses = monthExpenses.filter(e => e.expenseType === 'employee').reduce((acc, e) => acc + e.amount, 0);
  const totalCompanyExpenses = officeExpenses + employeeExpenses;

  // Estimated Payroll
  const calculatedItems = employees.map(emp =>
    calculateEmployeePayroll(emp, currentCompany, activePayrollMonth, attendances, overtimes, advances)
  );
  const totalBaseSalaries = employees.reduce((acc, e) => acc + e.salary, 0);
  const estimatedNetPayroll = calculatedItems.reduce((acc, item) => acc + item.finalPayableSalary, 0);

  // Advances summary (Section 25)
  const activeAdvances = advances.filter(a => a.status === 'active');
  const totalOutstandingAdvances = activeAdvances.reduce((acc, a) => acc + a.remainingBalance, 0);

  // Approvals by Role
  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const pendingOvertimes = overtimes.filter(o => o.status === 'pending');
  const pendingAdvances = advances.filter(a => a.status === 'pending');
  const pendingExpensesList = expenses.filter(e => e.status === 'pending');

  const visiblePendingLeaves = canApproveLeave ? pendingLeaves : [];
  const visiblePendingOvertimes = canApproveOvertime ? pendingOvertimes : [];
  const visiblePendingAdvances = canApproveAdvance ? pendingAdvances : [];
  const visiblePendingExpenses = canApproveExpense ? pendingExpensesList : [];

  const totalPendingApprovals =
    visiblePendingLeaves.length +
    visiblePendingOvertimes.length +
    visiblePendingAdvances.length +
    visiblePendingExpenses.length;

  // White vs Blue Collar
  const whiteCollarCount = employees.filter(e => e.employeeType === 'white_collar').length;
  const blueCollarCount = employees.filter(e => e.employeeType === 'blue_collar').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="truncate">Workspace: {currentCompany.name}</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              {currentRole === 'owner' && 'Executive Owner Dashboard'}
              {currentRole === 'supervisor' && 'Supervisor Operations Hub'}
              {currentRole === 'accountant' && 'Finance & Expenses Command'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {currentRole === 'owner' &&
                'Real-time overview of workforce attendance, advance settlements, overtime costs, and payroll estimates.'}
              {currentRole === 'supervisor' &&
                'Monitor shop-floor attendance, submit overtime, and manage leave requests with minimal clicks.'}
              {currentRole === 'accountant' &&
                'Track company cash flows, office vouchers, employee reimbursements, and advance disbursals.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 md:pt-0">
            <div className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium shrink-0">
              <span className="text-slate-400">Date:</span>{' '}
              <span className="font-bold text-white">{sampleToday}</span>
            </div>
            {currentRole === 'owner' && (
              <button
                onClick={() => setActiveTab('payroll')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-1.5"
              >
                <span>Process {activePayrollMonth} Payroll</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
            {currentRole === 'supervisor' && (
              <button
                onClick={() => setActiveTab('attendance_quick')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-1.5"
              >
                <span>Open Quick Attendance</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
            {currentRole === 'accountant' && (
              <button
                onClick={() => setActiveTab('expenses')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-1.5"
              >
                <span>Add Expense Voucher</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics based on Role */}
      {currentRole === 'owner' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Workforce"
            value={employees.length}
            subtitle={`${whiteCollarCount} White-Collar • ${blueCollarCount} Labour Workers`}
            icon={<Users className="w-5 h-5" />}
            color="indigo"
            onClick={() => setActiveTab('employees')}
          />
          <MetricCard
            title="Present Today"
            value={`${presentToday} / ${employees.length}`}
            subtitle={`${absentToday} Absent • ${halfDayToday} Half-Day • ${leaveToday} On Leave`}
            icon={<UserCheck className="w-5 h-5" />}
            color="emerald"
            onClick={() => setActiveTab('attendance_quick')}
          />
          <MetricCard
            title={`Est. ${activePayrollMonth} Payroll`}
            value={formatCurrency(estimatedNetPayroll, sym)}
            subtitle={`Base: ${formatCurrency(totalBaseSalaries, sym)} • OT: +${formatCurrency(totalOtCost, sym)}`}
            icon={<DollarSign className="w-5 h-5" />}
            color="purple"
            onClick={() => setActiveTab('payroll')}
          />
          <MetricCard
            title="Total Expenses"
            value={formatCurrency(totalCompanyExpenses, sym)}
            subtitle={`Office: ${formatCurrency(officeExpenses, sym)} • Employee: ${formatCurrency(employeeExpenses, sym)}`}
            icon={<Receipt className="w-5 h-5" />}
            color="rose"
            onClick={() => setActiveTab('expenses')}
          />
        </div>
      )}

      {currentRole === 'supervisor' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Assigned Workers"
            value={employees.length}
            subtitle="Shop floor & administrative staff"
            icon={<Users className="w-5 h-5" />}
            color="indigo"
          />
          <MetricCard
            title="Present Today"
            value={presentToday}
            subtitle={`${Math.round((presentToday / (employees.length || 1)) * 100)}% active attendance`}
            icon={<UserCheck className="w-5 h-5" />}
            color="emerald"
          />
          <MetricCard
            title="Absences / Leaves"
            value={absentToday + leaveToday}
            subtitle={`${absentToday} direct absent • ${leaveToday} approved leave`}
            icon={<UserX className="w-5 h-5" />}
            color="rose"
          />
          <MetricCard
            title="Overtime Hours (Month)"
            value={`${totalOtHours} hrs`}
            subtitle={`Across ${monthOvertimes.length} recorded overtime shifts`}
            icon={<Clock className="w-5 h-5" />}
            color="amber"
            onClick={() => setActiveTab('overtime')}
          />
        </div>
      )}

      {currentRole === 'accountant' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Monthly Expenses"
            value={formatCurrency(totalCompanyExpenses, sym)}
            subtitle={`${monthExpenses.length} approved expense vouchers`}
            icon={<Receipt className="w-5 h-5" />}
            color="indigo"
          />
          <MetricCard
            title="Office Overhead"
            value={formatCurrency(officeExpenses, sym)}
            subtitle="Rent, power, equipment & maintenance"
            icon={<TrendingUp className="w-5 h-5" />}
            color="sky"
          />
          <MetricCard
            title="Employee Reimbursements"
            value={formatCurrency(employeeExpenses, sym)}
            subtitle="Travel, food & hospitality claims"
            icon={<DollarSign className="w-5 h-5" />}
            color="emerald"
          />
          <MetricCard
            title="Outstanding Advances"
            value={formatCurrency(totalOutstandingAdvances, sym)}
            subtitle={`${activeAdvances.length} active employee recovery schedules`}
            icon={<Banknote className="w-5 h-5" />}
            color="amber"
            onClick={() => setActiveTab('advances')}
          />
        </div>
      )}

      {/* Middle Row: Pending Approvals Alert Bar + Quick Insights */}
      <div className={currentRole === 'supervisor' ? "grid grid-cols-1 gap-6" : "grid grid-cols-1 lg:grid-cols-3 gap-6"}>
        {/* Approvals Widget */}
        <div className={currentRole === 'supervisor' ? "col-span-1 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs" : "lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs"}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">Pending Approvals Action Center</h2>
                <p className="text-xs text-slate-500 truncate">Items requiring review or sign-off</p>
              </div>
            </div>

            {totalPendingApprovals > 0 ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                {totalPendingApprovals} Pending
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                All Cleared
              </span>
            )}
          </div>

          <div className="space-y-3">
            {totalPendingApprovals === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl">
                <p className="text-sm font-semibold text-slate-700">No pending items!</p>
                <p className="text-xs text-slate-400 mt-1">All requests under your review scope are up to date.</p>
              </div>
            ) : (
              <>
                {canApproveLeave && visiblePendingLeaves.slice(0, 2).map(l => {
                  const emp = employees.find(e => e.id === l.employeeId);
                  return (
                    <div
                      key={l.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-indigo-50/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {emp?.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">{emp?.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200 shrink-0">
                              Leave: {l.daysCount} days
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{l.reason}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('approvals')}
                        className="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 shadow-xs shrink-0 text-center"
                      >
                        Review Leave
                      </button>
                    </div>
                  );
                })}

                {canApproveOvertime && visiblePendingOvertimes.slice(0, 1).map(ot => {
                  const emp = employees.find(e => e.id === ot.employeeId);
                  return (
                    <div
                      key={ot.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-emerald-50/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                          OT
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">{emp?.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 shrink-0">
                              Overtime: {ot.hours} hrs {canViewSalary && `(+${formatCurrency(ot.totalAmount, sym)})`}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">Date: {formatDate(ot.date)} • {ot.notes || 'Shift Overtime'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('approvals')}
                        className="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 shadow-xs shrink-0 text-center"
                      >
                        Review Overtime
                      </button>
                    </div>
                  );
                })}

                {canApproveAdvance && visiblePendingAdvances.slice(0, 1).map(a => {
                  const emp = employees.find(e => e.id === a.employeeId);
                  return (
                    <div
                      key={a.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-amber-50/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                          ADV
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">{emp?.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200 shrink-0">
                              Salary Advance: {formatCurrency(a.amount, sym)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{a.reason}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('advances')}
                        className="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-amber-700 hover:bg-amber-50 shadow-xs shrink-0 text-center"
                      >
                        Review Advance
                      </button>
                    </div>
                  );
                })}

                {canApproveExpense && visiblePendingExpenses.slice(0, 1).map(e => (
                  <div
                    key={e.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-rose-50/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
                        EXP
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">{e.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200 shrink-0">
                            Voucher Claim: {formatCurrency(e.amount, sym)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {e.category} • Submitted by {e.paidBy} for reimbursement
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('expenses')}
                      className="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 shadow-xs shrink-0 text-center"
                    >
                      Review Voucher
                    </button>
                  </div>
                ))}
              </>
            )}

            {totalPendingApprovals > 3 && (
              <button
                onClick={() => setActiveTab('approvals')}
                className="w-full py-2 text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View all {totalPendingApprovals} pending items →
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Operational Snapshot Card (Owner / Accountant only; Removed for Supervisor) */}
        {currentRole !== 'supervisor' && (
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-indigo-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded">
                  Operational Overview
                </span>
                <span className="text-xs font-semibold text-slate-500">{activePayrollMonth}</span>
              </div>

              {currentRole === 'owner' && (
                <>
                  <h3 className="text-base font-bold text-slate-900">Monthly Payroll Readiness</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Real-time payroll liability estimation including overtime additions and advance deductions.
                  </p>

                  <div className="mt-4 p-3 bg-white rounded-xl border border-indigo-100/80 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Base Salaries ({employees.length} staff):</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(totalBaseSalaries, sym)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>+ Approved Overtime:</span>
                      <span className="font-semibold">+{formatCurrency(totalOtCost, sym)}</span>
                    </div>
                    <div className="flex justify-between text-amber-700">
                      <span>- Active Advance Balance:</span>
                      <span className="font-semibold">{formatCurrency(totalOutstandingAdvances, sym)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-bold text-indigo-900">
                      <span>Estimated Net Payable:</span>
                      <span>{formatCurrency(estimatedNetPayroll, sym)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('payroll')}
                    className="mt-4 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
                  >
                    Go to Payroll Engine →
                  </button>
                </>
              )}

              {currentRole === 'accountant' && (
                <>
                  <h3 className="text-base font-bold text-slate-900">Expense & Voucher Overview</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Tracking pending staff reimbursement vouchers, office expense claims, and advance recovery streams.
                  </p>

                  <div className="mt-4 p-3 bg-white rounded-xl border border-indigo-100/80 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Office Overhead:</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(officeExpenses, sym)}</span>
                    </div>
                    <div className="flex justify-between text-rose-600">
                      <span>Staff Expense Claims:</span>
                      <span className="font-semibold">{formatCurrency(employeeExpenses, sym)}</span>
                    </div>
                    <div className="flex justify-between text-amber-700">
                      <span>Advance Recovery Pool:</span>
                      <span className="font-semibold">{formatCurrency(totalOutstandingAdvances, sym)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-bold text-indigo-900">
                      <span>Pending Expense Claims:</span>
                      <span className="text-rose-700">{pendingExpensesList.length} vouchers</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('expenses')}
                    className="mt-4 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
                  >
                    Manage Expense Vouchers →
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Row: Today's Workforce Attendance Breakdown & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Breakdown Bar */}
        <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Today's Workforce Status</h3>
              <p className="text-xs text-slate-500">Distribution across active shifts</p>
            </div>
            <button
              onClick={() => setActiveTab('attendance_quick')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Update Attendance →
            </button>
          </div>

          {/* Graphical Progress Bar */}
          <div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${(presentToday / (employees.length || 1)) * 100}%` }}
              className="bg-emerald-500 h-full transition-all"
              title={`Present: ${presentToday}`}
            />
            <div
              style={{ width: `${(halfDayToday / (employees.length || 1)) * 100}%` }}
              className="bg-amber-400 h-full transition-all"
              title={`Half-Day: ${halfDayToday}`}
            />
            <div
              style={{ width: `${(leaveToday / (employees.length || 1)) * 100}%` }}
              className="bg-sky-400 h-full transition-all"
              title={`Leave: ${leaveToday}`}
            />
            <div
              style={{ width: `${(absentToday / (employees.length || 1)) * 100}%` }}
              className="bg-rose-500 h-full transition-all"
              title={`Absent: ${absentToday}`}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-left">
              <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Present
              </span>
              <p className="text-xl font-bold text-emerald-950 mt-1">{presentToday}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-left">
              <span className="text-[11px] font-semibold text-amber-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Half-Day
              </span>
              <p className="text-xl font-bold text-amber-950 mt-1">{halfDayToday}</p>
            </div>
            <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100 text-left">
              <span className="text-[11px] font-semibold text-sky-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-500" /> Leaves
              </span>
              <p className="text-xl font-bold text-sky-950 mt-1">{leaveToday}</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-left">
              <span className="text-[11px] font-semibold text-rose-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Absent
              </span>
              <p className="text-xl font-bold text-rose-950 mt-1">{absentToday}</p>
            </div>
          </div>
        </div>

        {/* Quick System Navigation Cards */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-2.5">
          <h3 className="text-base font-bold text-slate-900 mb-2">Shortcuts</h3>

          {currentRole === 'supervisor' && (
            <>
              <button
                onClick={() => setActiveTab('attendance_quick')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Mark Daily Attendance</p>
                    <p className="text-[11px] text-slate-500">Rapid morning shift roster entry</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab('overtime')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Log Overtime Hours</p>
                    <p className="text-[11px] text-slate-500">Record extra factory & shift hours</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab('approvals')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Review Leaves & Overtime</p>
                    <p className="text-[11px] text-slate-500">Action pending supervisory approvals</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab('attendance_grid')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Attendance Calendar Matrix</p>
                    <p className="text-[11px] text-slate-500">Month-wide workforce status view</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>
            </>
          )}

          {currentRole === 'accountant' && (
            <>
              <button
                onClick={() => setActiveTab('expenses')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/30 flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Expense Vouchers & Claims</p>
                    <p className="text-[11px] text-slate-500">Office overhead & reimbursements</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab('advances')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Salary Advances Ledger</p>
                    <p className="text-[11px] text-slate-500">Track recovery & disbursals</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab('approvals')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Review Pending Vouchers</p>
                    <p className="text-[11px] text-slate-500">Action advance & expense queues</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>
            </>
          )}

          {currentRole === 'owner' && (
            <>
              <button
                onClick={() => setActiveTab('attendance_quick')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Mark Daily Attendance</p>
                    <p className="text-[11px] text-slate-500">Single-click bulk attendance</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab('advances')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Record Salary Advance</p>
                    <p className="text-[11px] text-slate-500">Section 25 recovery schedules</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Company Settings</p>
                    <p className="text-[11px] text-slate-500">Basis days, overtime, leaves</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
