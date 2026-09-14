import React from 'react';
import { Modal } from '../components/common/Modal';
import { PayrollItemCalculation, CompanySettings } from '../types';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { Printer, Download, Sparkles, Building2, CheckCircle } from 'lucide-react';

interface PayslipModalProps {
  item: PayrollItemCalculation | null;
  onClose: () => void;
  month: string;
  company: CompanySettings;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ item, onClose, month, company }) => {
  if (!item) return null;

  const sym = company.currencySymbol;

  const totalEarnings = item.baseSalary + item.overtimeEarnings + item.bonuses + item.allowances;
  const totalDeductions =
    item.absentDeductions +
    item.unpaidLeaveDeductions +
    item.halfDayDeductions +
    item.advanceRecovery +
    item.otherDeductions;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={!!item}
      onClose={onClose}
      title="Employee Payslip"
      subtitle={`Payroll Period: ${getMonthName(month)} (${month})`}
      maxWidth="2xl"
      actions={
        <div className="flex items-center justify-between w-full no-print">
          <span className="text-xs text-slate-500 font-medium">Ready for print & audit archive</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export PDF</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="printable-area p-6 bg-white text-slate-900 space-y-6 text-xs border border-slate-200 rounded-2xl">
        {/* Company Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                {company.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{company.name}</h2>
                <p className="text-[11px] text-slate-500">Corporate HRMS Payroll & Workforce Settlement</p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 font-bold text-xs uppercase tracking-wider border border-indigo-200">
              Salary Payslip
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Period: {getMonthName(month)}</p>
          </div>
        </div>

        {/* Employee & Pay Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div>
            <p className="text-slate-400 text-[10px] font-semibold uppercase">Employee Name</p>
            <p className="font-bold text-slate-900 text-xs mt-0.5">{item.employeeName}</p>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-semibold uppercase">Employee Code</p>
            <p className="font-mono font-bold text-slate-900 text-xs mt-0.5">{item.employeeCode}</p>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-semibold uppercase">Designation</p>
            <p className="font-semibold text-slate-900 text-xs mt-0.5">{item.designation}</p>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-semibold uppercase">Department</p>
            <p className="font-semibold text-slate-900 text-xs mt-0.5">{item.department}</p>
          </div>
        </div>

        {/* Attendance Summary Strip */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-[11px]">
          <div>
            <span className="text-slate-500">Present:</span>{' '}
            <strong className="text-emerald-700">{item.presentDays} days</strong>
          </div>
          <div>
            <span className="text-slate-500">Paid Leave:</span>{' '}
            <strong className="text-sky-700">{item.paidLeaveDays} days</strong>
          </div>
          <div>
            <span className="text-slate-500">Half Days:</span>{' '}
            <strong className="text-amber-700">{item.halfDays} days</strong>
          </div>
          <div>
            <span className="text-slate-500">Unpaid/Absent:</span>{' '}
            <strong className="text-rose-700">{item.absentDays + item.unpaidLeaveDays} days</strong>
          </div>
          <div>
            <span className="text-slate-500">Overtime:</span>{' '}
            <strong className="text-indigo-700">{item.overtimeHours} hrs</strong>
          </div>
        </div>

        {/* Earnings vs Deductions Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Earnings */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800 pb-1 border-b border-emerald-200 flex justify-between">
              <span>Earnings</span>
              <span>Amount</span>
            </h4>
            <div className="space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span>Base Monthly Salary</span>
                <span className="font-semibold text-slate-900">{formatCurrency(item.baseSalary, sym)}</span>
              </div>
              <div className="flex justify-between">
                <span>Overtime ({item.overtimeHours} hrs @ {formatCurrency(item.hourlyRate, sym)}/hr)</span>
                <span className="font-semibold text-emerald-700">+{formatCurrency(item.overtimeEarnings, sym)}</span>
              </div>
              {item.bonuses > 0 && (
                <div className="flex justify-between">
                  <span>Performance Bonus</span>
                  <span className="font-semibold text-emerald-700">+{formatCurrency(item.bonuses, sym)}</span>
                </div>
              )}
              {item.allowances > 0 && (
                <div className="flex justify-between">
                  <span>Special Allowance</span>
                  <span className="font-semibold text-emerald-700">+{formatCurrency(item.allowances, sym)}</span>
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
              <span>Gross Earnings</span>
              <span className="text-emerald-700">{formatCurrency(totalEarnings, sym)}</span>
            </div>
          </div>

          {/* Deductions */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-rose-800 pb-1 border-b border-rose-200 flex justify-between">
              <span>Deductions</span>
              <span>Amount</span>
            </h4>
            <div className="space-y-2 text-slate-700">
              {item.absentDeductions > 0 && (
                <div className="flex justify-between">
                  <span>Absent Deductions ({item.absentDays} days)</span>
                  <span className="font-semibold text-rose-700">-{formatCurrency(item.absentDeductions, sym)}</span>
                </div>
              )}
              {item.unpaidLeaveDeductions > 0 && (
                <div className="flex justify-between">
                  <span>Unpaid Leaves ({item.unpaidLeaveDays} days)</span>
                  <span className="font-semibold text-rose-700">-{formatCurrency(item.unpaidLeaveDeductions, sym)}</span>
                </div>
              )}
              {item.halfDayDeductions > 0 && (
                <div className="flex justify-between">
                  <span>Half-Day Deductions ({item.halfDays} days @ 50%)</span>
                  <span className="font-semibold text-amber-700">-{formatCurrency(item.halfDayDeductions, sym)}</span>
                </div>
              )}
              {item.advanceRecovery > 0 && (
                <div className="flex justify-between">
                  <span>Salary Advance Recovery (Sec 25)</span>
                  <span className="font-bold text-indigo-700">-{formatCurrency(item.advanceRecovery, sym)}</span>
                </div>
              )}
              {item.otherDeductions > 0 && (
                <div className="flex justify-between">
                  <span>Other Authorized Deductions</span>
                  <span className="font-semibold text-rose-700">-{formatCurrency(item.otherDeductions, sym)}</span>
                </div>
              )}
              {totalDeductions === 0 && (
                <div className="text-slate-400 italic py-1">No deductions this cycle.</div>
              )}
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
              <span>Total Deductions</span>
              <span className="text-rose-700">-{formatCurrency(totalDeductions, sym)}</span>
            </div>
          </div>
        </div>

        {/* Net Salary Total Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shadow-md">
          <div>
            <p className="text-[11px] text-indigo-300 font-semibold uppercase tracking-wider">Final Net Payable Salary</p>
            <p className="text-xs text-slate-400 mt-0.5">Disbursed directly to registered bank account</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold tracking-tight text-white">
              {formatCurrency(item.finalPayableSalary, sym)}
            </span>
          </div>
        </div>

        {/* Signatures and Verification Footer */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-500">
          <div>
            <div className="w-36 h-0.5 bg-slate-300 mx-auto mb-1.5" />
            <p className="font-semibold text-slate-700">Employer Authorized Signatory</p>
            <p>Rajesh Sharma, Owner</p>
          </div>
          <div>
            <div className="w-36 h-0.5 bg-slate-300 mx-auto mb-1.5" />
            <p className="font-semibold text-slate-700">Employee Acknowledgment</p>
            <p>{item.employeeName}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
