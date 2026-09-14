import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PayrollItemCalculation } from '../types';
import { MetricCard } from '../components/common/MetricCard';
import { Modal } from '../components/common/Modal';
import { PayslipModal } from './PayslipModal';
import { calculateEmployeePayroll } from '../utils/payrollCalculator';
import { formatCurrency, getMonthName } from '../utils/formatters';
import {
  DollarSign,
  Calculator,
  Lock,
  FileText,
  Clock,
  Banknote,
  Sparkles,
  HelpCircle,
  TrendingDown,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const PayrollView: React.FC = () => {
  const {
    employees,
    attendances,
    overtimes,
    advances,
    currentCompany,
    activePayrollMonth,
    setActivePayrollMonth,
    payrollRuns,
    finalizePayroll,
    currentRole
  } = useApp();

  const [selectedPayslipItem, setSelectedPayslipItem] = useState<PayrollItemCalculation | null>(null);
  const [calculationBreakdownItem, setCalculationBreakdownItem] = useState<PayrollItemCalculation | null>(null);
  const [adjustingItem, setAdjustingItem] = useState<PayrollItemCalculation | null>(null);
  const [adjustments, setAdjustments] = useState<Record<string, { bonuses: number; allowances: number; otherDeductions: number; notes: string }>>({});
  const [finalizeSuccess, setFinalizeSuccess] = useState(false);

  const sym = currentCompany.currencySymbol;

  // Check if current month is already finalized
  const existingRun = payrollRuns.find(
    r => r.companyId === currentCompany.id && r.payrollMonth === activePayrollMonth && r.status === 'finalized'
  );

  // Compute live payroll items
  const payrollItems: PayrollItemCalculation[] = existingRun
    ? existingRun.items
    : employees.map(emp => {
        const manual = adjustments[emp.id];
        return calculateEmployeePayroll(
          emp,
          currentCompany,
          activePayrollMonth,
          attendances,
          overtimes,
          advances,
          manual
        );
      });

  // Aggregate totals
  const totalBase = payrollItems.reduce((acc, i) => acc + i.baseSalary, 0);
  const totalOvertime = payrollItems.reduce((acc, i) => acc + i.overtimeEarnings, 0);
  const totalAdditions = payrollItems.reduce((acc, i) => acc + i.bonuses + i.allowances, 0);
  const totalDeductions = payrollItems.reduce(
    (acc, i) =>
      acc +
      i.absentDeductions +
      i.unpaidLeaveDeductions +
      i.halfDayDeductions +
      i.advanceRecovery +
      i.otherDeductions,
    0
  );
  const totalNetPayable = payrollItems.reduce((acc, i) => acc + i.finalPayableSalary, 0);

  const handleFinalize = () => {
    if (confirm(`Confirm finalization of payroll for ${getMonthName(activePayrollMonth)}? This will lock calculations and settle advance balances.`)) {
      finalizePayroll(activePayrollMonth, payrollItems);
      setFinalizeSuccess(true);
      setTimeout(() => setFinalizeSuccess(false), 4000);
    }
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;
    setAdjustingItem(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Payslip Modal */}
      <PayslipModal
        item={selectedPayslipItem}
        onClose={() => setSelectedPayslipItem(null)}
        month={activePayrollMonth}
        company={currentCompany}
      />

      {/* Top Banner & Month Selector */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Configurable Payroll Engine</h2>
            {existingRun ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Lock className="w-3 h-3" /> FINALIZED & LOCKED
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Clock className="w-3 h-3" /> LIVE DRAFT COMPUTATION
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Basis: <strong>{currentCompany.salaryCalculationBasis}</strong> • Overtime Multiplier:{' '}
            <strong>{currentCompany.overtimeMultiplier}x</strong> • Half-Day Policy:{' '}
            <strong>{currentCompany.halfDayDeductionPercent}%</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <input
              type="month"
              value={activePayrollMonth}
              onChange={e => setActivePayrollMonth(e.target.value)}
              className="bg-transparent focus:outline-none text-slate-900 font-bold"
            />
          </div>

          {!existingRun && (
            <button
              onClick={handleFinalize}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              <Lock className="w-4 h-4" />
              <span>Finalize & Lock Payroll</span>
            </button>
          )}
        </div>
      </div>

      {finalizeSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white flex items-center justify-between shadow-lg shadow-emerald-500/20 animate-fade-in text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>
              Payroll for {getMonthName(activePayrollMonth)} finalized! Advances deducted & payslips ready.
            </span>
          </div>
          <span className="text-[11px] opacity-90">Locked in Audit Log</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Base Salary"
          value={formatCurrency(totalBase, sym)}
          subtitle={`Across ${payrollItems.length} registered employees`}
          icon={<DollarSign className="w-5 h-5" />}
          color="indigo"
        />
        <MetricCard
          title="Overtime Additions"
          value={`+${formatCurrency(totalOvertime, sym)}`}
          subtitle="Computed from approved extra shift hours"
          icon={<Clock className="w-5 h-5" />}
          color="emerald"
        />
        <MetricCard
          title="Total Deductions"
          value={`-${formatCurrency(totalDeductions, sym)}`}
          subtitle="Absence cuts + half days + advance recoveries"
          icon={<TrendingDown className="w-5 h-5" />}
          color="rose"
        />
        <MetricCard
          title="Net Disbursal Total"
          value={formatCurrency(totalNetPayable, sym)}
          subtitle="Net funds required for monthly bank transfer"
          icon={<Banknote className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Mobile Payroll Cards List */}
      <div className="block md:hidden space-y-3">
        {payrollItems.map(item => {
          const isWhite = item.employeeType === 'white_collar';

          return (
            <div key={item.employeeId} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-xs truncate">{item.employeeName}</p>
                  <p className="text-[11px] text-slate-400 font-mono truncate">
                    {item.employeeCode} • {isWhite ? 'White-Collar' : 'Labour Worker'}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                  Present: {item.presentDays}d • HD: {item.halfDays}d
                </span>
              </div>

              {/* Salary Breakdown Row */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Base Monthly Salary:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(item.baseSalary, sym)}</span>
                </div>

                {item.overtimeEarnings > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>+ Overtime ({item.overtimeHours}h):</span>
                    <span className="font-bold">+{formatCurrency(item.overtimeEarnings, sym)}</span>
                  </div>
                )}

                {item.unpaidLeaveDeductions > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>- Absent / Unpaid Cut:</span>
                    <span className="font-semibold">-{formatCurrency(item.unpaidLeaveDeductions, sym)}</span>
                  </div>
                )}

                {item.halfDayDeductions > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>- Half-Day Cut ({item.halfDays}d):</span>
                    <span className="font-semibold">-{formatCurrency(item.halfDayDeductions, sym)}</span>
                  </div>
                )}

                {item.advanceRecovery > 0 && (
                  <div className="flex justify-between text-indigo-700 font-medium">
                    <span>- Advance Recovery:</span>
                    <span className="font-semibold">-{formatCurrency(item.advanceRecovery, sym)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200/80 flex justify-between items-center text-sm font-black text-indigo-950">
                  <span>Net Payable:</span>
                  <span className="text-base text-indigo-600">{formatCurrency(item.finalPayableSalary, sym)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setCalculationBreakdownItem(item)}
                  className="flex-1 py-2 rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-xs text-center shadow-xs"
                >
                  Breakdown
                </button>
                <button
                  onClick={() => setSelectedPayslipItem(item)}
                  className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs text-center shadow-xs flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Payslip</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Payroll Calculations Master Table */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-3">Base Salary</th>
                <th className="py-3.5 px-3 text-emerald-700">Overtime (+)</th>
                <th className="py-3.5 px-3 text-rose-700">Absence Cut (-)</th>
                <th className="py-3.5 px-3 text-amber-700">Half-Day (-)</th>
                <th className="py-3.5 px-3 text-indigo-700">Advance Recovery (-)</th>
                <th className="py-3.5 px-4 font-extrabold text-slate-900">Net Payable</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payrollItems.map(item => {
                const isWhite = item.employeeType === 'white_collar';

                return (
                  <tr key={item.employeeId} className="hover:bg-slate-50/70 transition-colors">
                    {/* Employee */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{item.employeeName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {item.employeeCode} • {isWhite ? 'White-Collar' : 'Labour Worker'}
                        </p>
                      </div>
                    </td>

                    {/* Base */}
                    <td className="py-3.5 px-3 font-semibold text-slate-800">
                      {formatCurrency(item.baseSalary, sym)}
                    </td>

                    {/* Overtime */}
                    <td className="py-3.5 px-3 font-semibold text-emerald-700">
                      {item.overtimeEarnings > 0 ? (
                        <span>
                          +{formatCurrency(item.overtimeEarnings, sym)}{' '}
                          <span className="text-[10px] text-slate-400">({item.overtimeHours}h)</span>
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Absent Deductions */}
                    <td className="py-3.5 px-3 font-semibold text-rose-700">
                      {item.absentDeductions + item.unpaidLeaveDeductions > 0 ? (
                        <span>
                          -{formatCurrency(item.absentDeductions + item.unpaidLeaveDeductions, sym)}{' '}
                          <span className="text-[10px] text-slate-400">
                            ({item.absentDays + item.unpaidLeaveDays}d)
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Half Day */}
                    <td className="py-3.5 px-3 font-semibold text-amber-700">
                      {item.halfDayDeductions > 0 ? (
                        <span>
                          -{formatCurrency(item.halfDayDeductions, sym)}{' '}
                          <span className="text-[10px] text-slate-400">({item.halfDays}d)</span>
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Advance Recovery (Section 25) */}
                    <td className="py-3.5 px-3 font-bold text-indigo-700">
                      {item.advanceRecovery > 0 ? (
                        <span>-{formatCurrency(item.advanceRecovery, sym)}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Final Net Payable */}
                    <td className="py-3.5 px-4 font-extrabold text-sm text-slate-900 bg-indigo-50/20">
                      {formatCurrency(item.finalPayableSalary, sym)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setCalculationBreakdownItem(item)}
                          title="View Formula & Step-by-Step Proof"
                          className="px-2.5 py-1 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-[11px] shadow-xs"
                        >
                          Breakdown
                        </button>
                        <button
                          onClick={() => setSelectedPayslipItem(item)}
                          title="Generate Official Payslip"
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] shadow-xs flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Payslip</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Step-by-Step Mathematical Calculation Breakdown Modal */}
      {calculationBreakdownItem && (
        <Modal
          isOpen={!!calculationBreakdownItem}
          onClose={() => setCalculationBreakdownItem(null)}
          title={`Calculation Breakdown: ${calculationBreakdownItem.employeeName}`}
          subtitle={`Formula verification per Section 20 & 21 of the word document`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Context */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between font-bold text-slate-900 text-sm">
                <span>{calculationBreakdownItem.employeeName} ({calculationBreakdownItem.employeeCode})</span>
                <span className="text-indigo-600">{formatCurrency(calculationBreakdownItem.baseSalary, sym)} / mo</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 block">Calculation Basis</span>
                  <strong className="text-slate-800">{calculationBreakdownItem.calculationBasisDays} Days</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Daily Salary</span>
                  <strong className="text-slate-800">{formatCurrency(calculationBreakdownItem.dailySalary, sym)} / day</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Standard Hours</span>
                  <strong className="text-slate-800">{currentCompany.standardWorkingHours} hrs / day</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Hourly OT Rate</span>
                  <strong className="text-slate-800">{formatCurrency(calculationBreakdownItem.hourlyRate, sym)} / hr</strong>
                </div>
              </div>
            </div>

            {/* Step-by-Step Ledger List */}
            <div className="border border-slate-200 rounded-2xl p-4 space-y-2.5">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>1. Base Monthly Salary:</span>
                <span className="font-bold">{formatCurrency(calculationBreakdownItem.baseSalary, sym)}</span>
              </div>

              <div className="flex justify-between text-emerald-700">
                <span>
                  2. Overtime Earnings (+):{' '}
                  <span className="text-[11px] text-slate-500">
                    {calculationBreakdownItem.overtimeHours} hrs × {formatCurrency(calculationBreakdownItem.hourlyRate, sym)}
                  </span>
                </span>
                <span className="font-bold">+{formatCurrency(calculationBreakdownItem.overtimeEarnings, sym)}</span>
              </div>

              <div className="flex justify-between text-rose-700">
                <span>
                  3. Absent Days Deduction (-):{' '}
                  <span className="text-[11px] text-slate-500">
                    {calculationBreakdownItem.absentDays} days × {formatCurrency(calculationBreakdownItem.dailySalary, sym)}
                  </span>
                </span>
                <span className="font-bold">-{formatCurrency(calculationBreakdownItem.absentDeductions, sym)}</span>
              </div>

              <div className="flex justify-between text-rose-700">
                <span>
                  4. Unpaid Leave Deduction (-):{' '}
                  <span className="text-[11px] text-slate-500">
                    {calculationBreakdownItem.unpaidLeaveDays} days × {formatCurrency(calculationBreakdownItem.dailySalary, sym)}
                  </span>
                </span>
                <span className="font-bold">-{formatCurrency(calculationBreakdownItem.unpaidLeaveDeductions, sym)}</span>
              </div>

              <div className="flex justify-between text-amber-700">
                <span>
                  5. Half-Day Deduction (-):{' '}
                  <span className="text-[11px] text-slate-500">
                    {calculationBreakdownItem.halfDays} days × ({formatCurrency(calculationBreakdownItem.dailySalary, sym)} × {currentCompany.halfDayDeductionPercent}%)
                  </span>
                </span>
                <span className="font-bold">-{formatCurrency(calculationBreakdownItem.halfDayDeductions, sym)}</span>
              </div>

              <div className="flex justify-between text-indigo-700">
                <span>
                  6. Salary Advance Recovery (Section 25) (-):
                </span>
                <span className="font-bold">-{formatCurrency(calculationBreakdownItem.advanceRecovery, sym)}</span>
              </div>

              {calculationBreakdownItem.otherDeductions > 0 && (
                <div className="flex justify-between text-rose-700">
                  <span>7. Other Authorized Deductions (-):</span>
                  <span className="font-bold">-{formatCurrency(calculationBreakdownItem.otherDeductions, sym)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-extrabold text-slate-900 bg-slate-50 p-2.5 rounded-xl">
                <span>= Final Payable Salary:</span>
                <span className="text-indigo-600">{formatCurrency(calculationBreakdownItem.finalPayableSalary, sym)}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed">
              <strong>Formula Verified:</strong>{' '}
              <code>
                {formatCurrency(calculationBreakdownItem.baseSalary, sym)} +{' '}
                {formatCurrency(calculationBreakdownItem.overtimeEarnings, sym)} -{' '}
                {formatCurrency(calculationBreakdownItem.absentDeductions, sym)} -{' '}
                {formatCurrency(calculationBreakdownItem.unpaidLeaveDeductions, sym)} -{' '}
                {formatCurrency(calculationBreakdownItem.halfDayDeductions, sym)} -{' '}
                {formatCurrency(calculationBreakdownItem.advanceRecovery, sym)} ={' '}
                {formatCurrency(calculationBreakdownItem.finalPayableSalary, sym)}
              </code>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCalculationBreakdownItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
