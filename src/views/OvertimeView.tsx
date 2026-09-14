import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OvertimeRecord } from '../types';
import { MetricCard } from '../components/common/MetricCard';
import { Modal } from '../components/common/Modal';
import { ApprovalStatusBadge } from '../components/common/Badge';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  Calculator
} from 'lucide-react';

export const OvertimeView: React.FC = () => {
  const {
    overtimes,
    employees,
    recordOvertime,
    approveOvertime,
    rejectOvertime,
    currentCompany,
    currentRole,
    canViewSalary
  } = useApp();

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Form state
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [otDate, setOtDate] = useState(new Date().toISOString().split('T')[0]);
  const [otHours, setOtHours] = useState(2);
  const [otNotes, setOtNotes] = useState('');

  const sym = currentCompany.currencySymbol;

  // Selected employee for live calculation
  const targetEmp = employees.find(e => e.id === selectedEmpId) || employees[0];
  const dailyWage = targetEmp ? targetEmp.salary / 30 : 0;
  const standardHours = currentCompany.standardWorkingHours || 8;
  const multiplier = targetEmp?.overtimeRateMultiplier || currentCompany.overtimeMultiplier || 1.0;
  const computedHourlyRate = Math.round((dailyWage / standardHours) * multiplier * 100) / 100;
  const computedTotalAmount = Math.round(otHours * computedHourlyRate * 100) / 100;

  // Metrics
  const approvedOvertimes = overtimes.filter(o => o.status === 'approved');
  const totalApprovedHours = approvedOvertimes.reduce((acc, o) => acc + o.hours, 0);
  const totalApprovedCost = approvedOvertimes.reduce((acc, o) => acc + o.totalAmount, 0);
  const pendingCount = overtimes.filter(o => o.status === 'pending').length;

  const filteredOvertimes = overtimes.filter(o => {
    if (filterStatus === 'ALL') return true;
    return o.status === filterStatus;
  });

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmp) return;

    recordOvertime({
      companyId: currentCompany.id,
      employeeId: targetEmp.id,
      date: otDate,
      hours: Number(otHours),
      hourlyRate: computedHourlyRate,
      totalAmount: computedTotalAmount,
      status: currentRole === 'owner' ? 'approved' : 'pending',
      recordedBy: currentRole === 'supervisor' ? 'Vikram Patel (Supervisor)' : 'Rajesh Sharma (Owner)',
      approvedBy: currentRole === 'owner' ? 'Rajesh Sharma (Owner)' : undefined,
      notes: otNotes
    });

    setIsRecordModalOpen(false);
    setOtNotes('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Overtime Hours"
          value={`${totalApprovedHours} hrs`}
          subtitle="Approved extra production shifts"
          icon={<Clock className="w-5 h-5" />}
          color="indigo"
        />
        {canViewSalary ? (
          <MetricCard
            title="Overtime Compensation"
            value={formatCurrency(totalApprovedCost, sym)}
            subtitle="Directly added to upcoming payroll"
            icon={<TrendingUp className="w-5 h-5" />}
            color="emerald"
          />
        ) : (
          <MetricCard
            title="Total OT Shifts"
            value={approvedOvertimes.length}
            subtitle="Approved production floor shifts"
            icon={<TrendingUp className="w-5 h-5" />}
            color="emerald"
          />
        )}
        <MetricCard
          title="Pending Sign-Offs"
          value={pendingCount}
          subtitle="Supervisory logs waiting for owner approval"
          icon={<HelpCircle className="w-5 h-5" />}
          color="amber"
        />
        <MetricCard
          title="Company OT Multiplier"
          value={`${currentCompany.overtimeMultiplier}x`}
          subtitle={`Standard Day: ${currentCompany.standardWorkingHours} hrs / day`}
          icon={<Calculator className="w-5 h-5" />}
          color="sky"
        />
      </div>

      {/* Header bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Overtime Management & Hourly Multiplier</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              Section 7 Spec
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {canViewSalary ? (
              <>
                Calculated as: <code>(Monthly Salary ÷ 30) ÷ 8 hrs × Overtime Multiplier</code>. Injected automatically into final payroll.
              </>
            ) : (
              'Record and monitor employee extra shift hours on the factory floor for supervisor approvals.'
            )}
          </p>
        </div>

        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Log Overtime Hours</span>
        </button>
      </div>

      {/* Mobile Overtime Card List */}
      <div className="block md:hidden space-y-3">
        {filteredOvertimes.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-400 text-xs">
            No overtime records found.
          </div>
        ) : (
          filteredOvertimes.map(ot => {
            const emp = employees.find(e => e.id === ot.employeeId);

            return (
              <div key={ot.id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                      OT
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs truncate">{emp?.name || 'Unknown'}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">
                        {emp?.employeeCode} • {formatDate(ot.date)}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <ApprovalStatusBadge status={ot.status} />
                  </div>
                </div>

                {/* Overtime Metrics */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block">Hours Worked</span>
                    <span className="text-sm font-extrabold text-indigo-700">{ot.hours} Hours</span>
                  </div>
                  {canViewSalary ? (
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block">Payable ({formatCurrency(ot.hourlyRate, sym)}/hr)</span>
                      <span className="text-sm font-extrabold text-emerald-700">+{formatCurrency(ot.totalAmount, sym)}</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block">Shift</span>
                      <span className="text-xs font-bold text-slate-700">Factory Overtime</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {ot.notes && (
                  <p className="text-xs text-slate-500 bg-amber-50/40 p-2 rounded-lg border border-amber-100/60">
                    <span className="font-bold text-slate-700">Notes: </span>{ot.notes}
                  </p>
                )}

                {/* Actions */}
                {ot.status === 'pending' && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => approveOvertime(ot.id)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center shadow-xs"
                    >
                      Approve Overtime
                    </button>
                    <button
                      onClick={() => rejectOvertime(ot.id)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs text-center"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Overtime Register Table */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Shift Date</th>
                <th className="py-3.5 px-4 text-center">Hours Worked</th>
                {canViewSalary && <th className="py-3.5 px-4">Hourly Rate</th>}
                {canViewSalary && <th className="py-3.5 px-4">Payable Amount</th>}
                <th className="py-3.5 px-4">Supervisor Notes</th>
                <th className="py-3.5 px-4">Approval Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOvertimes.length === 0 ? (
                <tr>
                  <td colSpan={canViewSalary ? 8 : 6} className="py-12 text-center text-slate-400">
                    No overtime records found.
                  </td>
                </tr>
              ) : (
                filteredOvertimes.map(ot => {
                  const emp = employees.find(e => e.id === ot.employeeId);
                  return (
                    <tr key={ot.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{emp?.name || 'Unknown'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {emp?.employeeCode} • {emp?.department}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">{formatDate(ot.date)}</td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 font-extrabold text-indigo-700">
                          {ot.hours} hrs
                        </span>
                      </td>

                      {canViewSalary && (
                        <td className="py-3.5 px-4 text-slate-600">
                          {formatCurrency(ot.hourlyRate, sym)} / hr
                        </td>
                      )}

                      {canViewSalary && (
                        <td className="py-3.5 px-4 font-bold text-emerald-700">
                          +{formatCurrency(ot.totalAmount, sym)}
                        </td>
                      )}

                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {ot.notes || <span className="text-slate-300 italic">None</span>}
                      </td>

                      <td className="py-3.5 px-4">
                        <ApprovalStatusBadge status={ot.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {ot.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => approveOvertime(ot.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectOvertime(ot.id)}
                              className="px-2 py-1 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 font-semibold text-[11px]"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">{ot.approvedBy || 'Owner Approved'}</span>
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

      {/* Record Overtime Modal with Live Math Breakdown */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Log Employee Overtime"
        subtitle="Automatic hourly compensation calculation based on monthly salary"
        maxWidth="md"
      >
        <form onSubmit={handleRecordSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Select Employee *</label>
            <select
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900"
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.employeeCode}{canViewSalary ? ` - ${formatCurrency(e.salary, sym)}/mo` : ` - ${e.department}`})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Shift Date</label>
              <input
                type="date"
                required
                value={otDate}
                onChange={e => setOtDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Overtime Hours Worked</label>
              <input
                type="number"
                min={0.5}
                max={24}
                step={0.5}
                required
                value={otHours}
                onChange={e => setOtHours(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
              />
            </div>
          </div>

          {/* Transparent Live Calculation Box */}
          {canViewSalary ? (
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1.5">
              <div className="flex items-center justify-between text-indigo-900 font-bold">
                <span>Automatic Rate Calculation:</span>
                <span>Section 7 Formula</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Monthly Salary:</span>
                <span>{formatCurrency(targetEmp?.salary || 0, sym)}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Daily Rate (÷ 30):</span>
                <span>{formatCurrency(dailyWage, sym)} / day</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Hourly Rate (÷ {standardHours} hrs × {multiplier}x):</span>
                <span className="font-bold text-slate-900">{formatCurrency(computedHourlyRate, sym)} / hr</span>
              </div>
              <div className="pt-2 border-t border-indigo-200/60 flex justify-between font-extrabold text-sm text-indigo-950">
                <span>Total Overtime Earnings:</span>
                <span className="text-emerald-700">+{formatCurrency(computedTotalAmount, sym)}</span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <p className="font-bold text-slate-800">Shift Logging Policy</p>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Logging {otHours} overtime hours for <strong className="text-slate-900">{targetEmp?.name}</strong>. Compensation rates and multiplier ({multiplier}x) are processed automatically in payroll upon sign-off.
              </p>
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Supervisor Notes</label>
            <input
              type="text"
              value={otNotes}
              onChange={e => setOtNotes(e.target.value)}
              placeholder="e.g. Night shift emergency order, weekend machine overhaul..."
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
              Log Overtime Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
