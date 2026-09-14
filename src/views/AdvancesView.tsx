import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SalaryAdvance } from '../types';
import { MetricCard } from '../components/common/MetricCard';
import { Modal } from '../components/common/Modal';
import { ApprovalStatusBadge } from '../components/common/Badge';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Banknote,
  CheckCircle2,
  Clock,
  Plus,
  ArrowDownCircle,
  HelpCircle,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Layers,
  History
} from 'lucide-react';

export const AdvancesView: React.FC = () => {
  const {
    advances,
    employees,
    recordAdvance,
    approveAdvance,
    rejectAdvance,
    settleAdvanceAmount,
    currentCompany,
    currentRole,
    canApproveAdvance,
    canViewSalary
  } = useApp();

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedAdvanceForHistory, setSelectedAdvanceForHistory] = useState<SalaryAdvance | null>(null);
  const [manualSettleModal, setManualSettleModal] = useState<SalaryAdvance | null>(null);
  const [manualSettleAmount, setManualSettleAmount] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // New Advance form
  const [formData, setFormData] = useState({
    employeeId: employees[0]?.id || '',
    advanceDate: new Date().toISOString().split('T')[0],
    amount: 5000,
    reason: '',
    paymentMethod: 'Bank Transfer' as SalaryAdvance['paymentMethod'],
    recoveryMode: 'monthly_installment' as SalaryAdvance['recoveryMode'],
    monthlyInstallmentAmount: 1000,
    expectedSettlementDate: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0],
    notes: ''
  });

  const sym = currentCompany.currencySymbol;

  // Selected employee
  const targetEmp = employees.find(e => e.id === formData.employeeId) || employees[0];

  // Advance Dashboard Metrics (Section 25)
  const totalAdvancesGiven = advances.reduce((acc, a) => acc + a.amount, 0);
  const totalAdvancesRecovered = advances.reduce((acc, a) => acc + a.amountRecovered, 0);
  const totalOutstanding = advances.reduce((acc, a) => acc + a.remainingBalance, 0);
  const activeSchedulesCount = advances.filter(a => a.status === 'active').length;
  const pendingApprovalsCount = advances.filter(a => a.status === 'pending').length;

  const filteredAdvances = advances.filter(a => {
    if (filterStatus === 'ALL') return true;
    return a.status === filterStatus;
  });

  const handleCreateAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId || formData.amount <= 0) return;

    recordAdvance({
      employeeId: formData.employeeId,
      advanceDate: formData.advanceDate,
      amount: Number(formData.amount),
      reason: formData.reason,
      paymentMethod: formData.paymentMethod,
      recoveryMode: formData.recoveryMode,
      monthlyInstallmentAmount:
        formData.recoveryMode === 'full_next_month' ? Number(formData.amount) : Number(formData.monthlyInstallmentAmount),
      expectedSettlementDate: formData.expectedSettlementDate,
      notes: formData.notes
    });

    setIsRecordModalOpen(false);
    setFormData({
      employeeId: employees[0]?.id || '',
      advanceDate: new Date().toISOString().split('T')[0],
      amount: 5000,
      reason: '',
      paymentMethod: 'Bank Transfer',
      recoveryMode: 'monthly_installment',
      monthlyInstallmentAmount: 1000,
      expectedSettlementDate: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleExecuteManualSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSettleModal) return;

    const numAmount = Number(manualSettleAmount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    // Never deduct more than remaining balance rule
    const validAmount = Math.min(manualSettleModal.remainingBalance, numAmount);
    settleAdvanceAmount(manualSettleModal.id, validAmount, 'Manual Off-Cycle Settlement');
    setManualSettleModal(null);
    setManualSettleAmount('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Row (Advance Dashboard - Section 25) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Advances Given"
          value={formatCurrency(totalAdvancesGiven, sym)}
          subtitle={`${advances.length} advance files sanctioned`}
          icon={<Banknote className="w-5 h-5" />}
          color="indigo"
        />
        <MetricCard
          title="Total Recovered"
          value={formatCurrency(totalAdvancesRecovered, sym)}
          subtitle="Deducted via monthly payroll runs"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
        />
        <MetricCard
          title="Outstanding Balance"
          value={formatCurrency(totalOutstanding, sym)}
          subtitle={`${activeSchedulesCount} active employee recovery schedules`}
          icon={<ArrowDownCircle className="w-5 h-5" />}
          color="amber"
        />
        <MetricCard
          title="Pending Approvals"
          value={pendingApprovalsCount}
          subtitle="Awaiting owner sign-off"
          icon={<Clock className="w-5 h-5" />}
          color="rose"
        />
      </div>

      {/* Action Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Salary Advances & Advance Settlement</h2>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              Section 25 Spec
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track advances, multi-month installment recoveries, and strict business limits preventing over-deductions.
          </p>
        </div>

        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Record Salary Advance</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['ALL', 'active', 'pending', 'settled'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              filterStatus === tab
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab === 'ALL' ? 'All Advances' : tab}
          </button>
        ))}
      </div>

      {/* Mobile Advances Card List */}
      <div className="block md:hidden space-y-3">
        {filteredAdvances.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-400 text-xs">
            No salary advances found for this filter.
          </div>
        ) : (
          filteredAdvances.map(adv => {
            const emp = employees.find(e => e.id === adv.employeeId);
            const recoveryPercent = Math.min(100, Math.round((adv.amountRecovered / adv.amount) * 100));

            return (
              <div key={adv.id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
                {/* Header: Employee & Advance Code */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                      ADV
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs truncate">{emp?.name || 'Unknown'}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {adv.advanceCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {emp?.employeeCode} • {formatDate(adv.advanceDate)}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <ApprovalStatusBadge status={adv.status} />
                  </div>
                </div>

                {/* Amounts Grid */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block">Sanctioned Amount</span>
                    <span className="font-bold text-slate-900 text-sm">{formatCurrency(adv.amount, sym)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block">Remaining Balance</span>
                    <span className={`font-extrabold text-sm ${adv.remainingBalance > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                      {formatCurrency(adv.remainingBalance, sym)}
                    </span>
                  </div>
                </div>

                {/* Recovery Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">{recoveryPercent}% recovered</span>
                    <span className="font-semibold text-emerald-700">
                      {formatCurrency(adv.amountRecovered, sym)} paid
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${recoveryPercent}%` }}
                    />
                  </div>
                </div>

                {/* Meta details */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Schedule:</span>
                  <span className="font-semibold text-slate-700">
                    {adv.recoveryMode === 'full_next_month' && 'Full Next Month'}
                    {adv.recoveryMode === 'monthly_installment' && `${formatCurrency(adv.monthlyInstallmentAmount || 0, sym)} / month`}
                    {adv.recoveryMode === 'custom_amount' && 'Custom Settlement'}
                  </span>
                </div>

                {adv.reason && (
                  <p className="text-[11px] text-slate-500 bg-amber-50/50 p-2 rounded-lg border border-amber-100/60">
                    <span className="font-semibold text-amber-900">Reason: </span>
                    {adv.reason}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {adv.status === 'pending' && canApproveAdvance && (
                    <>
                      <button
                        onClick={() => approveAdvance(adv.id)}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center shadow-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectAdvance(adv.id)}
                        className="flex-1 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs text-center"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {adv.status === 'active' && adv.remainingBalance > 0 && canApproveAdvance && (
                    <button
                      onClick={() => {
                        setManualSettleModal(adv);
                        setManualSettleAmount('');
                      }}
                      className="flex-1 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold text-xs text-center shadow-xs"
                    >
                      Settle Partial
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedAdvanceForHistory(adv)}
                    className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs text-center flex items-center justify-center gap-1.5"
                  >
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ledger</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Advances Table */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Advance Code & Employee</th>
                <th className="py-3.5 px-4">Disbursal Date</th>
                <th className="py-3.5 px-4">Sanctioned Amount</th>
                <th className="py-3.5 px-4">Recovery Progress</th>
                <th className="py-3.5 px-4">Remaining Balance</th>
                <th className="py-3.5 px-4">Monthly Schedule</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdvances.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No salary advances found for this filter.
                  </td>
                </tr>
              ) : (
                filteredAdvances.map(adv => {
                  const emp = employees.find(e => e.id === adv.employeeId);
                  const recoveryPercent = Math.min(100, Math.round((adv.amountRecovered / adv.amount) * 100));

                  return (
                    <tr key={adv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-[10px]">
                            ADV
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{adv.advanceCode}</p>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {emp?.name || 'Unknown'} ({emp?.employeeCode})
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{formatDate(adv.advanceDate)}</p>
                        <p className="text-[10px] text-slate-400">{adv.paymentMethod}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 text-sm">{formatCurrency(adv.amount, sym)}</span>
                        <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{adv.reason}</p>
                      </td>

                      <td className="py-3.5 px-4 w-40">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-500">{recoveryPercent}% recovered</span>
                            <span className="font-semibold text-emerald-700">
                              {formatCurrency(adv.amountRecovered, sym)}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${recoveryPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`font-extrabold text-sm ${
                            adv.remainingBalance > 0 ? 'text-amber-700' : 'text-slate-400'
                          }`}
                        >
                          {formatCurrency(adv.remainingBalance, sym)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {adv.recoveryMode === 'full_next_month' && 'Full Next Month'}
                          {adv.recoveryMode === 'monthly_installment' &&
                            `${formatCurrency(adv.monthlyInstallmentAmount || 0, sym)} / mo`}
                          {adv.recoveryMode === 'custom_amount' && 'Custom Settlement'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <ApprovalStatusBadge status={adv.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {adv.status === 'pending' && (
                            canApproveAdvance ? (
                              <>
                                <button
                                  onClick={() => approveAdvance(adv.id)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => rejectAdvance(adv.id)}
                                  className="px-2 py-1 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 font-semibold text-[11px]"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Pending Approval</span>
                            )
                          )}

                          {adv.status === 'active' && adv.remainingBalance > 0 && canApproveAdvance && (
                            <button
                              onClick={() => {
                                setManualSettleModal(adv);
                                setManualSettleAmount('');
                              }}
                              className="px-2.5 py-1 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 font-semibold text-[11px]"
                            >
                              Settle Partial
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedAdvanceForHistory(adv)}
                            title="View Recovery Ledger"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Advance Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Employee Salary Advance"
        subtitle="Sanction advance amount with automatic payroll deduction schedule"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAdvance} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Select Employee *</label>
            <select
              value={formData.employeeId}
              onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900"
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.employeeCode} - Salary: {formatCurrency(e.salary, sym)}/mo)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Advance Amount ({sym}) *</label>
              <input
                type="number"
                min={100}
                step={500}
                required
                value={formData.amount}
                onChange={e =>
                  setFormData({
                    ...formData,
                    amount: Number(e.target.value),
                    monthlyInstallmentAmount: Math.min(Number(e.target.value), formData.monthlyInstallmentAmount)
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Disbursal Date</label>
              <input
                type="date"
                required
                value={formData.advanceDate}
                onChange={e => setFormData({ ...formData, advanceDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="Cash">Cash (Petty Cash)</option>
                <option value="UPI">UPI Payment</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Recovery Mode</label>
              <select
                value={formData.recoveryMode}
                onChange={e => setFormData({ ...formData, recoveryMode: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-indigo-700"
              >
                <option value="full_next_month">Full Deduction in Next Payroll</option>
                <option value="monthly_installment">Fixed Monthly Installments</option>
                <option value="custom_amount">Custom Settlement Amount</option>
              </select>
            </div>
          </div>

          {formData.recoveryMode !== 'full_next_month' && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-bold text-amber-900">Monthly Deduction Amount ({sym})</label>
                <span className="text-[11px] text-amber-700 font-semibold">
                  ~{Math.ceil(formData.amount / (formData.monthlyInstallmentAmount || 1))} Months to Settle
                </span>
              </div>
              <input
                type="number"
                min={100}
                max={formData.amount}
                step={100}
                required
                value={formData.monthlyInstallmentAmount}
                onChange={e => setFormData({ ...formData, monthlyInstallmentAmount: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-lg border border-amber-300 font-bold text-amber-950 bg-white"
              />
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Reason for Advance *</label>
            <input
              type="text"
              required
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g. Medical emergency, child school fees, festival..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
            >
              Sanction Advance
            </button>
          </div>
        </form>
      </Modal>

      {/* Manual Settlement Modal with Real-Time Recalculation & Clean Inputs */}
      {manualSettleModal && (() => {
        const enteredVal = Math.max(0, Number(manualSettleAmount) || 0);
        const currentRecovered = manualSettleModal.amountRecovered;
        const remaining = manualSettleModal.remainingBalance;
        const effectiveSettlement = Math.min(enteredVal, remaining);
        const dynamicRecovered = currentRecovered + effectiveSettlement;
        const dynamicRemaining = Math.max(0, remaining - effectiveSettlement);
        const isOverRemaining = enteredVal > remaining;

        return (
          <Modal
            isOpen={!!manualSettleModal}
            onClose={() => setManualSettleModal(null)}
            title={`Manual Advance Settlement: ${manualSettleModal.advanceCode}`}
            subtitle="Record an off-cycle or direct recovery against this advance"
            maxWidth="sm"
          >
            <form onSubmit={handleExecuteManualSettlement} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Sanctioned Amount:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(manualSettleModal.amount, sym)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Recovered So Far:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-emerald-700">{formatCurrency(dynamicRecovered, sym)}</span>
                    {effectiveSettlement > 0 && (
                      <span className="text-[10px] text-emerald-600 font-semibold">(+{formatCurrency(effectiveSettlement, sym)})</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-amber-800 font-bold pt-1.5 border-t border-slate-200">
                  <span>Remaining Balance:</span>
                  <div className="flex items-center gap-1.5">
                    <span className={dynamicRemaining === 0 ? "text-emerald-700 font-extrabold" : "text-amber-800 font-bold"}>
                      {formatCurrency(dynamicRemaining, sym)}
                    </span>
                    {effectiveSettlement > 0 && dynamicRemaining === 0 && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Fully Cleared</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Settlement Amount to Recover Now ({sym}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">{sym}</span>
                  <input
                    type="number"
                    min={1}
                    max={manualSettleModal.remainingBalance}
                    step="any"
                    placeholder="Enter recovery amount..."
                    required
                    value={manualSettleAmount}
                    onChange={e => setManualSettleAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                {isOverRemaining && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold">
                    Warning: Settlement amount cannot exceed outstanding balance of {formatCurrency(remaining, sym)}.
                  </p>
                )}
                <p className="text-[10px] text-slate-400 mt-1">
                  Values above update automatically in real time as you type.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setManualSettleModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!manualSettleAmount || enteredVal <= 0 || isOverRemaining}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-all shadow-md shadow-emerald-600/20"
                >
                  Record Recovery
                </button>
              </div>
            </form>
          </Modal>
        );
      })()}

      {/* History Ledger Modal */}
      {selectedAdvanceForHistory && (
        <Modal
          isOpen={!!selectedAdvanceForHistory}
          onClose={() => setSelectedAdvanceForHistory(null)}
          title={`Settlement History: ${selectedAdvanceForHistory.advanceCode}`}
          subtitle={`Reason: ${selectedAdvanceForHistory.reason}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-slate-500">Sanctioned</p>
                <p className="font-bold text-slate-900">{formatCurrency(selectedAdvanceForHistory.amount, sym)}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50">
                <p className="text-emerald-700">Recovered</p>
                <p className="font-bold text-emerald-950">{formatCurrency(selectedAdvanceForHistory.amountRecovered, sym)}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50">
                <p className="text-amber-700">Remaining</p>
                <p className="font-bold text-amber-950">{formatCurrency(selectedAdvanceForHistory.remainingBalance, sym)}</p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Payroll Period</th>
                    <th className="py-2 px-3 text-right">Amount Deducted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedAdvanceForHistory.recoveryHistory.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-400">
                        No deductions processed yet.
                      </td>
                    </tr>
                  ) : (
                    selectedAdvanceForHistory.recoveryHistory.map(rec => (
                      <tr key={rec.id}>
                        <td className="py-2 px-3">{formatDate(rec.date)}</td>
                        <td className="py-2 px-3 font-semibold">{rec.payrollMonth}</td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-700">
                          -{formatCurrency(rec.amount, sym)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAdvanceForHistory(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
