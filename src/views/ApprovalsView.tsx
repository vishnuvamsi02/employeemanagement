import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LeaveRequest, OvertimeRecord, SalaryAdvance, ExpenseRecord } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import {
  FileCheck2,
  Clock,
  Calendar,
  Banknote,
  Receipt,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

export const ApprovalsView: React.FC = () => {
  const {
    leaves,
    overtimes,
    advances,
    expenses,
    employees,
    approveLeave,
    rejectLeave,
    approveOvertime,
    rejectOvertime,
    approveAdvance,
    rejectAdvance,
    approveExpense,
    rejectExpense,
    currentCompany,
    canApproveLeave,
    canApproveOvertime,
    canApproveAdvance,
    canApproveExpense,
    canViewSalary
  } = useApp();

  const sym = currentCompany.currencySymbol;

  // Modals
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [leaveDecision, setLeaveDecision] = useState<'paid_leave' | 'deducted_salary_leave'>('paid_leave');
  const [leaveNotes, setLeaveNotes] = useState('');

  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const pendingOvertimes = overtimes.filter(o => o.status === 'pending');
  const pendingAdvances = advances.filter(a => a.status === 'pending');
  const pendingExpenses = expenses.filter(e => e.status === 'pending');

  const visibleLeaves = canApproveLeave ? pendingLeaves : [];
  const visibleOvertimes = canApproveOvertime ? pendingOvertimes : [];
  const visibleAdvances = canApproveAdvance ? pendingAdvances : [];
  const visibleExpenses = canApproveExpense ? pendingExpenses : [];

  const totalPending =
    visibleLeaves.length + visibleOvertimes.length + visibleAdvances.length + visibleExpenses.length;

  const handleConfirmLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave) return;
    approveLeave(selectedLeave.id, leaveDecision, leaveNotes);
    setSelectedLeave(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Unified Approvals Command Hub</h2>
            {totalPending > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                {totalPending} Awaiting Review
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                ✓ All Items Cleared
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Centralized queue for employee leaves, overtime compensation logs, salary advances, and expense vouchers.
          </p>
        </div>
      </div>

      {totalPending === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Inbox Zero: No Pending Approvals</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            All leave applications, overtime shifts, salary advances, and expense reimbursement claims have been fully
            reviewed.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. Pending Leaves (Supervisor & Owner only) */}
          {canApproveLeave && visibleLeaves.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Pending Leave Requests ({visibleLeaves.length})</span>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Requires Paid vs Deducted Choice</span>
              </div>
              <div className="divide-y divide-slate-100">
                {visibleLeaves.map(l => {
                  const emp = employees.find(e => e.id === l.employeeId);
                  const isWhite = emp?.employeeType === 'white_collar';
                  const remaining = isWhite ? Math.max(0, (emp?.paidLeaveAllowance || 0) - (emp?.usedPaidLeaves || 0)) : 0;

                  return (
                    <div key={l.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{emp?.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                            {emp?.employeeCode}
                          </span>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {l.daysCount} Day(s) Leave
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1">
                          Period: {formatDate(l.startDate)} to {formatDate(l.endDate)} • Reason: {l.reason}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {isWhite ? `Available Paid Quota: ${remaining} days` : 'Labour Worker (No Paid Quota)'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => {
                            setSelectedLeave(l);
                            setLeaveDecision(isWhite ? 'paid_leave' : 'deducted_salary_leave');
                          }}
                          className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs text-center"
                        >
                          Decide (Paid or Deducted)
                        </button>
                        <button
                          onClick={() => rejectLeave(l.id)}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 font-semibold text-center shrink-0"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Pending Overtime (Supervisor & Owner only) */}
          {canApproveOvertime && visibleOvertimes.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Pending Overtime Logs ({visibleOvertimes.length})</span>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Logged by Supervisors</span>
              </div>
              <div className="divide-y divide-slate-100">
                {visibleOvertimes.map(ot => {
                  const emp = employees.find(e => e.id === ot.employeeId);
                  return (
                    <div key={ot.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{emp?.name}</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {ot.hours} Hours Overtime {canViewSalary && `(+${formatCurrency(ot.totalAmount, sym)})`}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1">
                          Date: {formatDate(ot.date)} • Logged by: {ot.recordedBy}{' '}
                          {canViewSalary && `• Hourly Rate: ${formatCurrency(ot.hourlyRate, sym)}/hr`}
                        </p>
                        {ot.notes && <p className="text-[11px] text-slate-400 mt-0.5">Notes: {ot.notes}</p>}
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => approveOvertime(ot.id)}
                          className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs text-center"
                        >
                          Approve Overtime
                        </button>
                        <button
                          onClick={() => rejectOvertime(ot.id)}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 font-semibold text-center shrink-0"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Pending Advances (Accountant & Owner only) */}
          {canApproveAdvance && visibleAdvances.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <Banknote className="w-4 h-4 text-amber-600" />
                  <span>Pending Salary Advances ({visibleAdvances.length})</span>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Section 25 Spec</span>
              </div>
              <div className="divide-y divide-slate-100">
                {visibleAdvances.map(adv => {
                  const emp = employees.find(e => e.id === adv.employeeId);
                  return (
                    <div key={adv.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{emp?.name}</span>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                            Advance: {formatCurrency(adv.amount, sym)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{adv.advanceCode}</span>
                        </div>
                        <p className="text-slate-600 mt-1">
                          Reason: {adv.reason} • Mode:{' '}
                          {adv.recoveryMode === 'monthly_installment'
                            ? `Installment (${formatCurrency(adv.monthlyInstallmentAmount || 0, sym)}/mo)`
                            : 'Full deduction next payroll'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => approveAdvance(adv.id)}
                          className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs text-center"
                        >
                          Sanction Advance
                        </button>
                        <button
                          onClick={() => rejectAdvance(adv.id)}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 font-semibold text-center shrink-0"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Pending Expenses (Accountant & Owner only) */}
          {canApproveExpense && visibleExpenses.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <Receipt className="w-4 h-4 text-rose-600" />
                  <span>Pending Expense Claims ({visibleExpenses.length})</span>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Voucher Reimbursements</span>
              </div>
              <div className="divide-y divide-slate-100">
                {visibleExpenses.map(exp => (
                  <div key={exp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{exp.title}</span>
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                          {formatCurrency(exp.amount, sym)}
                        </span>
                        <span className="text-[10px] text-slate-400">{exp.category}</span>
                      </div>
                      <p className="text-slate-600 mt-1">
                        Date: {formatDate(exp.date)} • Paid by: {exp.paidBy} • Method: {exp.paymentMethod}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => approveExpense(exp.id)}
                        className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs text-center"
                      >
                        Approve Claim
                      </button>
                      <button
                        onClick={() => rejectExpense(exp.id)}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 font-semibold text-center shrink-0"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leave Decision Modal */}
      {selectedLeave && (
        <Modal
          isOpen={!!selectedLeave}
          onClose={() => setSelectedLeave(null)}
          title="Sanction Leave: Select Wage Treatment"
          subtitle="Word Doc Rule: Approver must choose Paid Leave vs Deducted Salary Leave"
          maxWidth="md"
        >
          {(() => {
            const emp = employees.find(e => e.id === selectedLeave.employeeId);
            const dailyWage = (emp?.salary || 0) / 30;

            return (
              <form onSubmit={handleConfirmLeave} className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <p className="font-bold text-slate-900">{emp?.name}</p>
                  <p className="text-slate-600">
                    Duration: {selectedLeave.daysCount} days ({formatDate(selectedLeave.startDate)} to{' '}
                    {formatDate(selectedLeave.endDate)})
                  </p>
                  {canViewSalary && (
                    <p className="text-slate-600">Daily Salary Value: {formatCurrency(dailyWage, sym)}/day</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer ${
                      leaveDecision === 'paid_leave'
                        ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="paid_leave"
                      checked={leaveDecision === 'paid_leave'}
                      onChange={() => setLeaveDecision('paid_leave')}
                      className="mt-1 text-emerald-600"
                    />
                    <div>
                      <p className="font-bold text-emerald-950">Paid Leave (Zero Salary Cut)</p>
                      <p className="text-slate-500 text-[11px]">Subtracted from employee's annual leave balance.</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer ${
                      leaveDecision === 'deducted_salary_leave'
                        ? 'bg-rose-50/60 border-rose-300 ring-2 ring-rose-500/20'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="deducted_salary_leave"
                      checked={leaveDecision === 'deducted_salary_leave'}
                      onChange={() => setLeaveDecision('deducted_salary_leave')}
                      className="mt-1 text-rose-600"
                    />
                    <div>
                      <p className="font-bold text-rose-950">Deducted Salary Leave (Daily Wage Cut)</p>
                      <p className="text-slate-500 text-[11px]">
                        {canViewSalary
                          ? `Deducts ${formatCurrency(dailyWage * selectedLeave.daysCount, sym)} in payroll engine.`
                          : 'Absence will be deducted as unpaid leave in monthly payroll.'}
                      </p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Remarks</label>
                  <input
                    type="text"
                    value={leaveNotes}
                    onChange={e => setLeaveNotes(e.target.value)}
                    placeholder="Approval comments..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedLeave(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  >
                    Confirm Sanction
                  </button>
                </div>
              </form>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};
