import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/common/Modal';
import { Badge, AttendanceStatusBadge, ApprovalStatusBadge } from '../components/common/Badge';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building,
  Briefcase,
  CreditCard,
  Clock,
  Banknote,
  Receipt,
  CalendarDays,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';

export const EmployeeProfileModal: React.FC = () => {
  const {
    selectedEmployeeId,
    setSelectedEmployeeId,
    employees,
    attendances,
    leaves,
    overtimes,
    advances,
    expenses,
    currentCompany,
    canViewSalary
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'attendance' | 'leaves' | 'advances' | 'overtime' | 'expenses'
  >('overview');

  const employee = employees.find(e => e.id === selectedEmployeeId);

  if (!selectedEmployeeId || !employee) return null;

  const sym = currentCompany.currencySymbol;

  // Filter employee data
  const empAttendances = attendances
    .filter(a => a.employeeId === employee.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const empLeaves = leaves
    .filter(l => l.employeeId === employee.id)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  const empOvertimes = overtimes
    .filter(o => o.employeeId === employee.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const empAdvances = advances
    .filter(a => a.employeeId === employee.id)
    .sort((a, b) => b.advanceDate.localeCompare(a.advanceDate));

  const empExpenses = expenses
    .filter(e => e.employeeId === employee.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Attendance metrics
  const totalLoggedDays = empAttendances.length;
  const presentDays = empAttendances.filter(a => a.status === 'present').length;
  const absentDays = empAttendances.filter(a => a.status === 'absent').length;
  const halfDays = empAttendances.filter(a => a.status === 'half_day').length;
  const paidLeaveDays = empAttendances.filter(a => a.status === 'paid_leave').length;
  const unpaidLeaveDays = empAttendances.filter(a => a.status === 'unpaid_leave').length;

  // Total Advance Metrics
  const totalAdvancesGiven = empAdvances.reduce((acc, a) => acc + a.amount, 0);
  const totalAdvancesRecovered = empAdvances.reduce((acc, a) => acc + a.amountRecovered, 0);
  const totalOutstandingAdvance = empAdvances.reduce((acc, a) => acc + a.remainingBalance, 0);

  // Total Overtime
  const totalOvertimeHours = empOvertimes.filter(o => o.status === 'approved').reduce((acc, o) => acc + o.hours, 0);
  const totalOvertimeEarnings = empOvertimes.filter(o => o.status === 'approved').reduce((acc, o) => acc + o.totalAmount, 0);

  return (
    <Modal
      isOpen={!!selectedEmployeeId}
      onClose={() => setSelectedEmployeeId(null)}
      title="360° Employee Dossier"
      subtitle={`Complete profile, leave balance, advance recovery schedule & activity history`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Profile Header Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <img
              src={employee.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={employee.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-400/40 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight">{employee.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 font-mono font-bold">
                  {employee.employeeCode}
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                {employee.designation} • {employee.department}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    employee.employeeType === 'white_collar'
                      ? 'bg-sky-500/20 text-sky-200 border border-sky-400/30'
                      : 'bg-amber-500/20 text-amber-200 border border-amber-400/30'
                  }`}
                >
                  {employee.employeeType === 'white_collar' ? 'White-Collar (Office Staff)' : 'Labour / Blue-Collar'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 font-semibold uppercase">
                  {employee.employmentStatus}
                </span>
              </div>
            </div>
          </div>

          {canViewSalary ? (
            <div className="text-right sm:border-l sm:border-slate-700 sm:pl-6">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Monthly Base Salary</p>
              <p className="text-2xl font-extrabold text-white mt-0.5">{formatCurrency(employee.salary, sym)}</p>
              <p className="text-[10px] text-indigo-300 mt-0.5">
                Daily: {formatCurrency(employee.salary / 30, sym)} • Hourly: {formatCurrency(employee.salary / 30 / 8, sym)}
              </p>
            </div>
          ) : (
            <div className="text-right sm:border-l sm:border-slate-700 sm:pl-6">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Overtime Status</p>
              <p className="text-lg font-bold text-white mt-0.5">
                {employee.overtimeEligible ? `Eligible (${employee.overtimeRateMultiplier || 1.0}x)` : 'Ineligible'}
              </p>
              <p className="text-[10px] text-indigo-300 mt-0.5">Role: {employee.designation}</p>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Bank', icon: User },
            { id: 'attendance', label: `Attendance (${empAttendances.length})`, icon: CalendarDays },
            { id: 'leaves', label: `Leaves & Quota`, icon: Calendar },
            ...(canViewSalary ? [{ id: 'advances', label: `Salary Advances (${empAdvances.length})`, icon: Banknote }] : []),
            { id: 'overtime', label: `Overtime (${empOvertimes.length})`, icon: Clock },
            ...(canViewSalary ? [{ id: 'expenses', label: `Reimbursements (${empExpenses.length})`, icon: Receipt }] : [])
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview & Personal Info */}
        {activeTab === 'overview' && (
          <div className="space-y-5 text-xs">
            {/* Primary Details Grid: Personal & Educational Dossier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Personal & Statutory Details Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <User className="w-4 h-4 text-indigo-600" />
                  Personal & Statutory Information
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Name:</span>
                    <span className="font-semibold text-slate-900">{employee.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Father's Name:</span>
                    <span className="font-semibold text-slate-900">{employee.fatherName || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Gender:</span>
                    <span className="font-semibold text-slate-900">{employee.gender || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Date of Birth:</span>
                    <span className="font-semibold text-slate-900">{employee.dob ? formatDate(employee.dob) : '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Marital Status:</span>
                    <span className="font-semibold text-slate-900">{employee.maritalStatus || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Religion:</span>
                    <span className="font-semibold text-slate-900">{employee.religion || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Existing EPF UAN No:</span>
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {employee.epfUan || 'Not Registered'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Education, Experience & Contact Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Briefcase className="w-4 h-4 text-sky-600" />
                  Education, Experience & Contact
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Mobile (Phone):</span>
                    <span className="font-semibold text-slate-900">{employee.phone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Email ID:</span>
                    <span className="font-semibold text-slate-900">{employee.email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Languages Known:</span>
                    <span className="font-semibold text-slate-900">{employee.languagesKnown || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Qualification:</span>
                    <span className="font-semibold text-slate-900">{employee.qualification || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Experience:</span>
                    <span className="font-semibold text-slate-900">{employee.experience || '—'}</span>
                  </div>
                  <div className="py-1">
                    <span className="text-slate-500 block mb-0.5">Address:</span>
                    <span className="font-medium text-slate-800 leading-snug">{employee.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Employment & Bank Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Building className="w-4 h-4 text-indigo-600" />
                  Employment Information
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Employee ID:</span>
                    <span className="font-semibold text-slate-900">{employee.employeeCode}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Joining Date:</span>
                    <span className="font-semibold text-slate-900">{formatDate(employee.joiningDate)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Department:</span>
                    <span className="font-semibold text-slate-900">{employee.department}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Designation:</span>
                    <span className="font-semibold text-slate-900">{employee.designation}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Overtime Eligibility:</span>
                    <span className="font-semibold text-slate-900">
                      {employee.overtimeEligible ? `Eligible (${employee.overtimeRateMultiplier || 1.0}x)` : 'Ineligible'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Category Policy:</span>
                    <span className="font-semibold text-slate-900">
                      {employee.employeeType === 'blue_collar'
                        ? 'Labour (Absence = Daily Wage Cut)'
                        : 'White-Collar (Annual Paid Leaves)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bank & Disbursal Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  Bank & Disbursal Information
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Account Holder:</span>
                    <span className="font-semibold text-slate-900">{employee.bankDetails.accountName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Bank Name:</span>
                    <span className="font-semibold text-slate-900">{employee.bankDetails.bankName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Account Number:</span>
                    <span className="font-mono font-semibold text-slate-900">{employee.bankDetails.accountNumber}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">IFSC / Routing Code:</span>
                    <span className="font-mono font-semibold text-slate-900">{employee.bankDetails.ifscOrRouting}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Attendance Summary & Logs */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <p className="text-[11px] font-semibold text-emerald-700">Present</p>
                <p className="text-xl font-bold text-emerald-950 mt-0.5">{presentDays} days</p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                <p className="text-[11px] font-semibold text-rose-700">Absent</p>
                <p className="text-xl font-bold text-rose-950 mt-0.5">{absentDays} days</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-[11px] font-semibold text-amber-700">Half-Day</p>
                <p className="text-xl font-bold text-amber-950 mt-0.5">{halfDays} days</p>
              </div>
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
                <p className="text-[11px] font-semibold text-sky-700">Paid Leaves</p>
                <p className="text-xl font-bold text-sky-950 mt-0.5">{paidLeaveDays} days</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                <p className="text-[11px] font-semibold text-purple-700">Unpaid Leaves</p>
                <p className="text-xl font-bold text-purple-950 mt-0.5">{unpaidLeaveDays} days</p>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Work Hours</th>
                    <th className="py-2.5 px-4">Overtime Hours</th>
                    <th className="py-2.5 px-4">Logged By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {empAttendances.slice(0, 15).map(att => (
                    <tr key={att.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 font-medium text-slate-900">{formatDate(att.date)}</td>
                      <td className="py-2.5 px-4">
                        <AttendanceStatusBadge status={att.status} />
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">{att.workingHours} hrs</td>
                      <td className="py-2.5 px-4 text-slate-600">{att.overtimeHours || 0} hrs</td>
                      <td className="py-2.5 px-4 text-slate-500 text-[11px]">{att.markedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Leaves & Quotas */}
        {activeTab === 'leaves' && (
          <div className="space-y-4">
            {employee.employeeType === 'blue_collar' ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Labour Worker Leave Policy (Section 2)</p>
                  <p className="mt-1 leading-relaxed">
                    Blue-collar workers have no paid leave balance quota. All sanctioned or unsanctioned leaves are
                    categorized as unpaid leaves or deducted salary leaves during payroll computation.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-xs text-slate-500">Annual Paid Allowance</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{employee.paidLeaveAllowance} days</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                  <p className="text-xs text-amber-700">Used Paid Leaves</p>
                  <p className="text-2xl font-bold text-amber-950 mt-1">{employee.usedPaidLeaves} days</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                  <p className="text-xs text-emerald-700">Remaining Balance</p>
                  <p className="text-2xl font-bold text-emerald-950 mt-1">
                    {Math.max(0, employee.paidLeaveAllowance - employee.usedPaidLeaves)} days
                  </p>
                </div>
              </div>
            )}

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="p-3 bg-slate-50 font-bold text-xs text-slate-700 border-b border-slate-200">
                Leave Requests History
              </div>
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Date Range</th>
                    <th className="py-2 px-3">Duration</th>
                    <th className="py-2 px-3">Reason</th>
                    <th className="py-2 px-3">Status / Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {empLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">
                        No leave requests on record.
                      </td>
                    </tr>
                  ) : (
                    empLeaves.map(l => (
                      <tr key={l.id}>
                        <td className="py-2.5 px-3 font-medium text-slate-900">
                          {formatDate(l.startDate)} - {formatDate(l.endDate)}
                        </td>
                        <td className="py-2.5 px-3">{l.daysCount} days</td>
                        <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs">{l.reason}</td>
                        <td className="py-2.5 px-3">
                          <ApprovalStatusBadge status={l.status} />
                          {l.approvalType && (
                            <span className="ml-2 text-[10px] font-bold text-indigo-700">
                              ({l.approvalType === 'paid_leave' ? 'Paid Leave' : 'Deducted Salary'})
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Salary Advances (Section 25) */}
        {activeTab === 'advances' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
                <p className="text-xs text-indigo-700">Total Advances Given</p>
                <p className="text-xl font-bold text-indigo-950 mt-1">{formatCurrency(totalAdvancesGiven, sym)}</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                <p className="text-xs text-emerald-700">Amount Recovered</p>
                <p className="text-xl font-bold text-emerald-950 mt-1">{formatCurrency(totalAdvancesRecovered, sym)}</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                <p className="text-xs text-amber-700">Outstanding Balance</p>
                <p className="text-xl font-bold text-amber-950 mt-1">{formatCurrency(totalOutstandingAdvance, sym)}</p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="p-3 bg-slate-50 font-bold text-xs text-slate-700 border-b border-slate-200">
                Salary Advances Ledger (Section 25 Spec)
              </div>
              <div className="divide-y divide-slate-200">
                {empAdvances.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">No advance records for this employee.</div>
                ) : (
                  empAdvances.map(adv => (
                    <div key={adv.id} className="p-4 space-y-3 bg-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{adv.advanceCode}</span>
                            <ApprovalStatusBadge status={adv.status} />
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-600">
                              Mode: {adv.recoveryMode}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Disbursed: {formatDate(adv.advanceDate)} via {adv.paymentMethod} • Reason: {adv.reason}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-900">
                            Balance: {formatCurrency(adv.remainingBalance, sym)} / {formatCurrency(adv.amount, sym)}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Monthly Recovery: {formatCurrency(adv.monthlyInstallmentAmount || 0, sym)}
                          </p>
                        </div>
                      </div>

                      {/* Recovery Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all"
                          style={{ width: `${(adv.amountRecovered / adv.amount) * 100}%` }}
                        />
                      </div>

                      {/* Recovery History Subtable */}
                      {adv.recoveryHistory.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px]">
                          <p className="font-bold text-slate-700 mb-1">Payroll Deductions Settled:</p>
                          <div className="space-y-1">
                            {adv.recoveryHistory.map(rec => (
                              <div key={rec.id} className="flex justify-between text-slate-600">
                                <span>
                                  Payroll Month: <strong className="text-slate-900">{rec.payrollMonth}</strong> ({formatDate(rec.date)})
                                </span>
                                <span className="font-bold text-emerald-700">-{formatCurrency(rec.amount, sym)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Overtime */}
        {activeTab === 'overtime' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between text-xs">
              <div>
                <p className="text-indigo-900 font-bold">Total Approved Overtime</p>
                <p className="text-indigo-700 text-[11px] mt-0.5">
                  {canViewSalary
                    ? `Calculated based on standard hourly salary × ${employee.overtimeRateMultiplier || 1.0}x`
                    : 'Factory production & extra shift hours logged'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-indigo-950">{totalOvertimeHours} hours</p>
                {canViewSalary && (
                  <p className="text-xs font-semibold text-emerald-700">+{formatCurrency(totalOvertimeEarnings, sym)}</p>
                )}
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Hours</th>
                    {canViewSalary && <th className="py-2.5 px-4">Hourly Rate</th>}
                    {canViewSalary && <th className="py-2.5 px-4">Total Compensation</th>}
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {empOvertimes.map(ot => (
                    <tr key={ot.id}>
                      <td className="py-2.5 px-4 font-medium text-slate-900">{formatDate(ot.date)}</td>
                      <td className="py-2.5 px-4 font-semibold">{ot.hours} hrs</td>
                      {canViewSalary && <td className="py-2.5 px-4 text-slate-600">{formatCurrency(ot.hourlyRate, sym)}/hr</td>}
                      {canViewSalary && <td className="py-2.5 px-4 font-bold text-emerald-700">+{formatCurrency(ot.totalAmount, sym)}</td>}
                      <td className="py-2.5 px-4">
                        <ApprovalStatusBadge status={ot.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: Reimbursements */}
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Title & Category</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4">Payment Method</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {empExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No expense claims on file for this employee.
                      </td>
                    </tr>
                  ) : (
                    empExpenses.map(exp => (
                      <tr key={exp.id}>
                        <td className="py-2.5 px-4 font-medium text-slate-900">{formatDate(exp.date)}</td>
                        <td className="py-2.5 px-4">
                          <p className="font-semibold text-slate-900">{exp.title}</p>
                          <p className="text-[10px] text-slate-400">{exp.category}</p>
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">{formatCurrency(exp.amount, sym)}</td>
                        <td className="py-2.5 px-4 text-slate-600">{exp.paymentMethod}</td>
                        <td className="py-2.5 px-4">
                          <ApprovalStatusBadge status={exp.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
