import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CompanySettings, SalaryCalculationBasis } from '../types';
import { Settings, Save, Building2, Calculator, Clock, Calendar, CheckCircle2, Plus, X } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentCompany, updateCompanySettings } = useApp();

  const [formData, setFormData] = useState<CompanySettings>({ ...currentCompany });
  const [newCategory, setNewCategory] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    if (formData.expenseCategories.includes(newCategory.trim())) return;

    setFormData({
      ...formData,
      expenseCategories: [...formData.expenseCategories, newCategory.trim()]
    });
    setNewCategory('');
  };

  const handleRemoveCategory = (catToRemove: string) => {
    setFormData({
      ...formData,
      expenseCategories: formData.expenseCategories.filter(c => c !== catToRemove)
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Company Configuration & Rules</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              Section 19 Spec
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure payroll calculation formulas, standard hours, overtime multipliers, and leave policies.
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* General Company Identity */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-indigo-600" />
            Company Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Company Registered Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Company Code / Prefix</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Payroll Engine Math Configuration (Section 19 & 20) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
            <Calculator className="w-4 h-4 text-emerald-600" />
            Payroll Calculation Formula Basis
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Salary Calculation Basis *</label>
              <select
                value={formData.salaryCalculationBasis}
                onChange={e =>
                  setFormData({ ...formData, salaryCalculationBasis: e.target.value as SalaryCalculationBasis })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-indigo-700"
              >
                <option value="30_days">Fixed 30 Days (Standard Commercial Basis: Salary ÷ 30)</option>
                <option value="calendar_days">Actual Calendar Days in Month (28 - 31 Days)</option>
                <option value="working_days">Actual Working Days (Excluding Weekly Offs: ~26 Days)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Directly sets the daily wage divisor when computing unpaid absences and half-day cuts.
              </p>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Standard Working Hours / Day *</label>
              <input
                type="number"
                min={4}
                max={12}
                required
                value={formData.standardWorkingHours}
                onChange={e => setFormData({ ...formData, standardWorkingHours: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Used to compute hourly rate: <code>(Daily Salary ÷ Standard Hours)</code>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Overtime Multiplier *</label>
              <select
                value={formData.overtimeMultiplier}
                onChange={e => setFormData({ ...formData, overtimeMultiplier: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-emerald-700"
              >
                <option value="1.0">1.0x (Standard Single Hourly Rate)</option>
                <option value="1.25">1.25x (125% Rate)</option>
                <option value="1.5">1.5x (Time-and-a-Half Rate)</option>
                <option value="2.0">2.0x (Double Hourly Rate)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Half-Day Deduction Policy *</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={10}
                  max={100}
                  required
                  value={formData.halfDayDeductionPercent}
                  onChange={e => setFormData({ ...formData, halfDayDeductionPercent: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-amber-700"
                />
                <span className="font-bold text-slate-600">%</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Payroll Cycle Anchor Day</label>
              <input
                type="number"
                min={1}
                max={28}
                value={formData.payrollCycleDay}
                onChange={e => setFormData({ ...formData, payrollCycleDay: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Leave Quota Defaults (Section 2 & 6) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-sky-600" />
            Employee Category Leave Policies
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-2">
              <label className="font-bold text-sky-950 block">White-Collar Default Annual Paid Leaves</label>
              <input
                type="number"
                min={0}
                max={30}
                value={formData.whiteCollarDefaultLeaveQuota}
                onChange={e => setFormData({ ...formData, whiteCollarDefaultLeaveQuota: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-sky-200 font-bold bg-white"
              />
              <p className="text-[10px] text-sky-700">Office staff, managers, supervisors, administrative staff.</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
              <label className="font-bold text-amber-950 block">Labour Worker Leave Quota (Default: 0)</label>
              <input
                type="number"
                disabled
                value={formData.blueCollarDefaultLeaveQuota}
                className="w-full px-3 py-2 rounded-xl border border-amber-200 font-bold bg-amber-100/50 text-amber-900"
              />
              <p className="text-[10px] text-amber-700">
                Labour workers have zero paid leave benefits per Section 2 of the word specification.
              </p>
            </div>
          </div>
        </div>

        {/* Expense Categories Manager */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Approved Expense Categories</h3>

          <div className="flex flex-wrap gap-2">
            {formData.expenseCategories.map(cat => (
              <span
                key={cat}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200"
              >
                <span>{cat}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(cat)}
                  className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              placeholder="Add custom expense category..."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900"
            >
              Add Category
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Apply & Save Company Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
