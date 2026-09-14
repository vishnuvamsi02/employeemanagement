import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LeaveRequest } from '../types';
import { MetricCard } from '../components/common/MetricCard';
import { Modal } from '../components/common/Modal';
import { ApprovalStatusBadge } from '../components/common/Badge';
import { formatDate, formatCurrency } from '../utils/formatters';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  FileCheck2,
  Send,
  Sparkles
} from 'lucide-react';

export const LeavesView: React.FC = () => {
  const {
    leaves,
    employees,
    requestLeave,
    approveLeave,
    rejectLeave,
    currentCompany,
    currentRole,
    canViewSalary
  } = useApp();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [approvingLeave, setApprovingLeave] = useState<LeaveRequest | null>(null);
  const [approvalDecision, setApprovalDecision] = useState<'paid_leave' | 'deducted_salary_leave'>('paid_leave');
  const [approvalNotes, setApprovalNotes] = useState('');

  // Apply form state
  const [newLeaveForm, setNewLeaveForm] = useState({
    employeeId: employees[0]?.id || '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    daysCount: 1,
    reason: ''
  });

  const sym = currentCompany.currencySymbol;

  // Counts
  const pendingCount = leaves.filter(l => l.status === 'pending').length;
  const approvedPaidCount = leaves.filter(l => l.status === 'approved' && l.approvalType === 'paid_leave').length;
  const approvedDeductedCount = leaves.filter(l => l.status === 'approved' && l.approvalType === 'deducted_salary_leave').length;

  const handleOpenApproveModal = (leave: LeaveRequest) => {
    setApprovingLeave(leave);
    const emp = employees.find(e => e.id === leave.employeeId);
    // If blue collar, default to deducted salary leave per Section 2
    if (emp?.employeeType === 'blue_collar') {
      setApprovalDecision('deducted_salary_leave');
    } else {
      setApprovalDecision('paid_leave');
    }
    setApprovalNotes('');
  };

  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingLeave) return;

    approveLeave(approvingLeave.id, approvalDecision, approvalNotes);
    setApprovingLeave(null);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeaveForm.employeeId) return;

    requestLeave({
      companyId: currentCompany.id,
      employeeId: newLeaveForm.employeeId,
      startDate: newLeaveForm.startDate,
      endDate: newLeaveForm.endDate,
      daysCount: Number(newLeaveForm.daysCount),
      reason: newLeaveForm.reason,
      status: 'pending'
    });

    setIsApplyModalOpen(false);
    setNewLeaveForm({
      employeeId: employees[0]?.id || '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      daysCount: 1,
      reason: ''
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Leave Filings"
          value={leaves.length}
          subtitle="Requests recorded on register"
          icon={<Calendar className="w-5 h-5" />}
          color="indigo"
        />
        <MetricCard
          title="Pending Decisions"
          value={pendingCount}
          subtitle="Requiring Paid vs Deducted verdict"
          icon={<HelpCircle className="w-5 h-5" />}
          color="amber"
        />
        <MetricCard
          title="Sanctioned Paid"
          value={approvedPaidCount}
          subtitle="Protected leaves with zero wage cut"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
        />
        <MetricCard
          title="Salary Deducted Leaves"
          value={approvedDeductedCount}
          subtitle="Absences treated as daily wage cuts"
          icon={<XCircle className="w-5 h-5" />}
          color="rose"
        />
      </div>

      {/* Header bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Leave Management & Sanctioning</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              Section 2 & 6 Requirement
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Approver decision modal strictly asks whether leave is <strong>Paid Leave</strong> or <strong>Deducted Salary Leave</strong>.
          </p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20"
        >
          <Send className="w-4 h-4" />
          <span>Apply Leave Request</span>
        </button>
      </div>

      {/* Mobile Leaves Card List */}
      <div className="block md:hidden space-y-3">
        {leaves.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-400 text-xs">
            No leave requests on file.
          </div>
        ) : (
          leaves.map(l => {
            const emp = employees.find(e => e.id === l.employeeId);
            const isWhite = emp?.employeeType === 'white_collar';
            const remainingQuota = isWhite ? Math.max(0, (emp?.paidLeaveAllowance || 0) - (emp?.usedPaidLeaves || 0)) : 0;

            return (
              <div key={l.id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {emp?.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs truncate">{emp?.name || 'Unknown'}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">
                        {emp?.employeeCode} • {isWhite ? 'White-Collar' : 'Labour Worker'}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <ApprovalStatusBadge status={l.status} />
                  </div>
                </div>

                {/* Duration & Quota Info */}
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Duration:</span>
                    <div className="text-right">
                      <span className="font-bold text-slate-800">{formatDate(l.startDate)} to {formatDate(l.endDate)}</span>
                      <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {l.daysCount} Day(s)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60">
                    <span className="text-slate-500">Paid Quota:</span>
                    {isWhite ? (
                      <span className="font-semibold text-emerald-700">{remainingQuota} of {emp?.paidLeaveAllowance} days left</span>
                    ) : (
                      <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Labour (No Paid Quota)
                      </span>
                    )}
                  </div>
                </div>

                {/* Reason & Notes */}
                <div className="text-xs text-slate-600 bg-indigo-50/30 p-2.5 rounded-xl border border-indigo-100/60">
                  <p><span className="font-bold text-slate-800">Reason: </span>{l.reason}</p>
                  {l.notes && <p className="text-[11px] text-slate-400 mt-1 italic">Note: {l.notes}</p>}
                </div>

                {/* Approval Tag if decided */}
                {l.approvalType && (
                  <div className="text-xs">
                    <span
                      className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                        l.approvalType === 'paid_leave'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {l.approvalType === 'paid_leave' ? 'Paid Leave (No Salary Cut)' : 'Deducted Salary Leave'}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                {l.status === 'pending' ? (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleOpenApproveModal(l)}
                      className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs text-center shadow-xs"
                    >
                      Decide & Sanction
                    </button>
                    <button
                      onClick={() => rejectLeave(l.id)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs text-center"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 text-right">Decided by {l.approvedBy || 'Admin'}</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Leaves Register Table */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[170px]">Employee</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[150px]">Leave Duration</th>
                <th className="py-3.5 px-4 min-w-[180px] max-w-[220px]">Reason / Notes</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[160px]">Employee Quota</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[240px]">Approval Decision</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap min-w-[110px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No leave requests on file.
                  </td>
                </tr>
              ) : (
                leaves.map(l => {
                  const emp = employees.find(e => e.id === l.employeeId);
                  const isWhite = emp?.employeeType === 'white_collar';
                  const remainingQuota = isWhite ? Math.max(0, (emp?.paidLeaveAllowance || 0) - (emp?.usedPaidLeaves || 0)) : 0;

                  return (
                    <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900">{emp?.name || 'Unknown'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {emp?.employeeCode} • {isWhite ? 'White-Collar' : 'Labour Worker'}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-800">
                          {formatDate(l.startDate)} - {formatDate(l.endDate)}
                        </p>
                        <p className="text-[10px] font-bold text-indigo-600 mt-0.5">{l.daysCount} Day(s)</p>
                      </td>

                      <td className="py-3.5 px-4 max-w-[220px]">
                        <p className="text-slate-700 truncate font-medium" title={l.reason}>{l.reason}</p>
                        {l.notes && <p className="text-[10px] text-slate-400 mt-0.5 italic truncate" title={l.notes}>Note: {l.notes}</p>}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isWhite ? (
                          <div>
                            <span className="font-bold text-emerald-700">{remainingQuota} days left</span>
                            <span className="text-[10px] text-slate-400"> of {emp?.paidLeaveAllowance} quota</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 whitespace-nowrap inline-block">
                            Labour (No Paid Quota)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 flex-nowrap">
                          <ApprovalStatusBadge status={l.status} />
                          {l.approvalType && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap shrink-0 ${
                                l.approvalType === 'paid_leave'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {l.approvalType === 'paid_leave' ? 'Paid Leave (No Cut)' : 'Deducted Salary Leave'}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {l.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenApproveModal(l)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-xs"
                            >
                              Decide & Sanction
                            </button>
                            <button
                              onClick={() => rejectLeave(l.id)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 font-semibold text-[11px]"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Decided by {l.approvedBy || 'Admin'}</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Leave Approver Modal: "Is this leave a Paid Leave or Deducted Salary Leave?" */}
      {approvingLeave && (
        <Modal
          isOpen={!!approvingLeave}
          onClose={() => setApprovingLeave(null)}
          title="Sanction Leave Request"
          subtitle="Word Document Spec: For Leave approving person, the system must ask whether leave is paid or deducted."
          maxWidth="md"
        >
          {(() => {
            const emp = employees.find(e => e.id === approvingLeave.employeeId);
            const isWhite = emp?.employeeType === 'white_collar';
            const dailyWage = (emp?.salary || 0) / 30;
            const remaining = isWhite ? Math.max(0, (emp?.paidLeaveAllowance || 0) - (emp?.usedPaidLeaves || 0)) : 0;
            const potentialDeduction = dailyWage * approvingLeave.daysCount;

            return (
              <form onSubmit={handleConfirmApproval} className="space-y-4 text-xs">
                {/* Employee Context Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">{emp?.name}</span>
                    <span className="font-semibold text-indigo-600">
                      {isWhite ? 'White-Collar' : 'Labour Worker'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Days Requested:</span>
                    <span className="font-bold text-slate-900">{approvingLeave.daysCount} days</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Available Paid Quota:</span>
                    <span className="font-bold text-emerald-700">{remaining} days</span>
                  </div>
                  {canViewSalary && (
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>Daily Wage Value:</span>
                      <span className="font-bold text-slate-900">{formatCurrency(dailyWage, sym)}/day</span>
                    </div>
                  )}
                </div>

                {/* Core Question Prompt */}
                <div>
                  <label className="font-bold text-slate-900 block mb-2 text-sm">
                    Is this leave a Paid Leave or a Deducted Salary Leave?
                  </label>

                  <div className="space-y-2">
                    {/* Option 1: Paid Leave */}
                    <label
                      className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                        approvalDecision === 'paid_leave'
                          ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="approvalType"
                        value="paid_leave"
                        checked={approvalDecision === 'paid_leave'}
                        onChange={() => setApprovalDecision('paid_leave')}
                        className="mt-1 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <p className="font-bold text-emerald-950">Paid Leave (No Salary Deduction)</p>
                        <p className="text-slate-500 text-[11px] mt-0.5 leading-snug">
                          Deducts {approvingLeave.daysCount} day(s) from employee's paid leave quota. Monthly salary
                          remains 100% intact.
                        </p>
                        {remaining < approvingLeave.daysCount && (
                          <p className="text-[10px] text-amber-700 font-bold mt-1">
                            ⚠️ Note: Employee quota is low ({remaining} days remaining).
                          </p>
                        )}
                      </div>
                    </label>

                    {/* Option 2: Deducted Salary Leave */}
                    <label
                      className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                        approvalDecision === 'deducted_salary_leave'
                          ? 'bg-rose-50/60 border-rose-300 ring-2 ring-rose-500/20'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="approvalType"
                        value="deducted_salary_leave"
                        checked={approvalDecision === 'deducted_salary_leave'}
                        onChange={() => setApprovalDecision('deducted_salary_leave')}
                        className="mt-1 text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <p className="font-bold text-rose-950">Deducted Salary Leave (Unpaid Absence)</p>
                        <p className="text-slate-500 text-[11px] mt-0.5 leading-snug">
                          {canViewSalary
                            ? `Direct salary cut of ${formatCurrency(potentialDeduction, sym)} will be subtracted in the monthly payroll engine.`
                            : `Absence will be recorded as unpaid leave with corresponding salary deduction in monthly payroll.`}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Approver Remarks / Conditions</label>
                  <input
                    type="text"
                    value={approvalNotes}
                    onChange={e => setApprovalNotes(e.target.value)}
                    placeholder="e.g. Sanctioned subject to project handover..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setApprovingLeave(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
                  >
                    Confirm & Apply to Payroll
                  </button>
                </div>
              </form>
            );
          })()}
        </Modal>
      )}

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="File Leave Request"
        subtitle="Submit dates and reason for supervisory review"
        maxWidth="md"
      >
        <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Select Employee *</label>
            <select
              required
              value={newLeaveForm.employeeId}
              onChange={e => setNewLeaveForm({ ...newLeaveForm, employeeId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.employeeCode} - {e.employeeType === 'white_collar' ? 'White-Collar' : 'Labour'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Start Date</label>
              <input
                type="date"
                required
                value={newLeaveForm.startDate}
                onChange={e => setNewLeaveForm({ ...newLeaveForm, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">End Date</label>
              <input
                type="date"
                required
                value={newLeaveForm.endDate}
                onChange={e => setNewLeaveForm({ ...newLeaveForm, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Total Number of Days</label>
            <input
              type="number"
              min={0.5}
              step={0.5}
              required
              value={newLeaveForm.daysCount}
              onChange={e => setNewLeaveForm({ ...newLeaveForm, daysCount: parseFloat(e.target.value) || 1 })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Reason for Leave</label>
            <textarea
              required
              rows={3}
              value={newLeaveForm.reason}
              onChange={e => setNewLeaveForm({ ...newLeaveForm, reason: e.target.value })}
              placeholder="e.g. Attending family wedding, doctor visit, urgent personal work..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
            >
              Submit for Sanction
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
