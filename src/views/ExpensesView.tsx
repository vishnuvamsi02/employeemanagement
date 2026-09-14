import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ExpenseRecord } from '../types';
import { MetricCard } from '../components/common/MetricCard';
import { Modal } from '../components/common/Modal';
import { ApprovalStatusBadge } from '../components/common/Badge';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Receipt,
  Plus,
  Building,
  User,
  Paperclip,
  CheckCircle2,
  Clock,
  TrendingUp,
  CreditCard,
  FileText,
  DollarSign
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { expenses, employees, addExpense, approveExpense, rejectExpense, currentCompany, currentRole, canApproveExpense } = useApp();

  const [filterType, setFilterType] = useState<'ALL' | 'office' | 'employee'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState<ExpenseRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    amount: 1500,
    category: currentCompany.expenseCategories[0] || 'Office Rent',
    description: '',
    date: new Date().toISOString().split('T')[0],
    expenseType: 'office' as 'office' | 'employee',
    paidBy: 'Company Account',
    employeeId: employees[0]?.id || '',
    vendor: '',
    paymentMethod: 'Bank Transfer' as ExpenseRecord['paymentMethod'],
    receiptName: 'invoice_receipt.pdf',
    notes: ''
  });

  const sym = currentCompany.currencySymbol;

  // Metrics
  const totalCompanyExpenses = expenses.filter(e => e.status === 'approved').reduce((acc, e) => acc + e.amount, 0);
  const officeExpenses = expenses
    .filter(e => e.status === 'approved' && e.expenseType === 'office')
    .reduce((acc, e) => acc + e.amount, 0);
  const employeeExpenses = expenses
    .filter(e => e.status === 'approved' && e.expenseType === 'employee')
    .reduce((acc, e) => acc + e.amount, 0);
  const pendingCount = expenses.filter(e => e.status === 'pending').length;

  const filteredExpenses = expenses.filter(e => {
    const matchesType = filterType === 'ALL' || e.expenseType === filterType;
    const matchesCat = selectedCategory === 'ALL' || e.category === selectedCategory;
    return matchesType && matchesCat;
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.amount <= 0) return;

    addExpense({
      companyId: currentCompany.id,
      title: formData.title,
      amount: Number(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
      expenseType: formData.expenseType,
      paidBy: formData.expenseType === 'employee' ? 'Employee Reimbursement' : formData.paidBy,
      employeeId: formData.expenseType === 'employee' ? formData.employeeId : undefined,
      vendor: formData.vendor,
      paymentMethod: formData.paymentMethod,
      receiptName: formData.receiptName,
      status: currentRole === 'owner' ? 'approved' : 'pending',
      notes: formData.notes
    });

    setIsAddModalOpen(false);
    setFormData({
      title: '',
      amount: 1500,
      category: currentCompany.expenseCategories[0] || 'Office Rent',
      description: '',
      date: new Date().toISOString().split('T')[0],
      expenseType: 'office',
      paidBy: 'Company Account',
      employeeId: employees[0]?.id || '',
      vendor: '',
      paymentMethod: 'Bank Transfer',
      receiptName: 'invoice_receipt.pdf',
      notes: ''
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Approved Expenses"
          value={formatCurrency(totalCompanyExpenses, sym)}
          subtitle="Combined operational & workforce claims"
          icon={<Receipt className="w-5 h-5" />}
          color="indigo"
        />
        <MetricCard
          title="Office Overhead"
          value={formatCurrency(officeExpenses, sym)}
          subtitle="Rent, power, internet & factory maintenance"
          icon={<Building className="w-5 h-5" />}
          color="sky"
        />
        <MetricCard
          title="Employee Reimbursements"
          value={formatCurrency(employeeExpenses, sym)}
          subtitle="Travel, client hospitality & site meals"
          icon={<User className="w-5 h-5" />}
          color="emerald"
        />
        <MetricCard
          title="Pending Vouchers"
          value={pendingCount}
          subtitle="Awaiting accountant/owner approval"
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Header and Controls */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Expense Management & Bill Vouchers</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              Section 10 & 11 Spec
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track company operational bills alongside individual employee travel & food claims.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center p-1 bg-white rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterType === 'ALL' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Expenses ({expenses.length})
          </button>
          <button
            onClick={() => setFilterType('office')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterType === 'office' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Office Bills ({expenses.filter(e => e.expenseType === 'office').length})
          </button>
          <button
            onClick={() => setFilterType('employee')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterType === 'employee' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Employee Claims ({expenses.filter(e => e.expenseType === 'employee').length})
          </button>
        </div>

        {/* Category selector */}
        <div className="w-56">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-semibold bg-white focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {currentCompany.expenseCategories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Expenses Card List */}
      <div className="block md:hidden space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-400 text-xs">
            No expense records found.
          </div>
        ) : (
          filteredExpenses.map(exp => {
            const isOffice = exp.expenseType === 'office';

            return (
              <div key={exp.id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
                      EXP
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs truncate">{exp.title}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">
                        {exp.expenseCode} • {formatDate(exp.date)}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <ApprovalStatusBadge status={exp.status} />
                  </div>
                </div>

                {/* Amount & Category */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block">Claim Amount</span>
                    <span className="text-sm font-extrabold text-slate-900">{formatCurrency(exp.amount, sym)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block">Classification</span>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mt-0.5 ${
                      isOffice ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {isOffice ? 'Office Overhead' : 'Staff Claim'}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Category: <strong className="text-slate-700">{exp.category}</strong></span>
                  <span>Paid By: <strong className="text-slate-700">{exp.paidBy}</strong></span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {exp.receiptUrl && (
                    <button
                      onClick={() => setPreviewReceipt(exp)}
                      className="px-3 py-2 rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold text-xs flex items-center gap-1 shrink-0"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </button>
                  )}

                  {exp.status === 'pending' && canApproveExpense && (
                    <>
                      <button
                        onClick={() => approveExpense(exp.id)}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center shadow-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectExpense(exp.id)}
                        className="flex-1 py-2 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs text-center"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Expense List Table */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Expense Voucher</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Classification</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Bill Attachment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => {
                  const emp = employees.find(e => e.id === exp.employeeId);
                  const isOffice = exp.expenseType === 'office';

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{exp.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {exp.expenseCode} • Paid by {exp.paidBy}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">{formatDate(exp.date)}</td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isOffice
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {isOffice ? '🏢 Office Bill' : `👤 ${emp?.name || 'Employee'}`}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">{exp.category}</td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">{formatCurrency(exp.amount, sym)}</td>

                      <td className="py-3.5 px-4 text-slate-600">{exp.paymentMethod}</td>

                      <td className="py-3.5 px-4">
                        {exp.receiptName ? (
                          <button
                            onClick={() => setPreviewReceipt(exp)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[100px]">{exp.receiptName}</span>
                          </button>
                        ) : (
                          <span className="text-slate-300 italic">No bill</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <ApprovalStatusBadge status={exp.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {exp.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => approveExpense(exp.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectExpense(exp.id)}
                              className="px-2 py-1 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 font-semibold text-[11px]"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">{exp.approvedBy || 'Approved'}</span>
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

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Expense Voucher"
        subtitle="Submit office operational overhead or employee reimbursement claim"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Expense Type *</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer font-bold ${
                  formData.expenseType === 'office'
                    ? 'bg-sky-50 border-sky-300 text-sky-900 ring-1 ring-sky-400'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="expenseType"
                  value="office"
                  checked={formData.expenseType === 'office'}
                  onChange={() => setFormData({ ...formData, expenseType: 'office' })}
                  className="text-sky-600"
                />
                <span>🏢 Office Operational Overhead</span>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer font-bold ${
                  formData.expenseType === 'employee'
                    ? 'bg-purple-50 border-purple-300 text-purple-900 ring-1 ring-purple-400'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="expenseType"
                  value="employee"
                  checked={formData.expenseType === 'employee'}
                  onChange={() => setFormData({ ...formData, expenseType: 'employee' })}
                  className="text-purple-600"
                />
                <span>👤 Employee Reimbursement</span>
              </label>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Voucher Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Factory Electricity Bill, Site Travel Petrol, Workshop Supplies..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Amount ({sym}) *</label>
              <input
                type="number"
                min={1}
                step={50}
                required
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
              >
                {currentCompany.expenseCategories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formData.expenseType === 'employee' ? (
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Claimant Employee *</label>
              <select
                value={formData.employeeId}
                onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold"
              >
                {employees.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.employeeCode} - {e.department})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Paid By</label>
                <input
                  type="text"
                  value={formData.paidBy}
                  onChange={e => setFormData({ ...formData, paidBy: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  placeholder="Company Account / Priya Nair (Accountant)"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Vendor / Agency</label>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  placeholder="e.g. MSEDCL, Castrol Agency..."
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Expense Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                <option value="Company Card">Company Debit/Credit Card</option>
                <option value="Petty Cash">Petty Cash</option>
                <option value="Cash">Direct Cash</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Attach Receipt / Invoice (Simulated)</label>
            <div className="p-3 border border-dashed border-slate-300 rounded-xl bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600">
                <Paperclip className="w-4 h-4 text-indigo-600" />
                <span className="font-mono text-[11px] font-semibold">{formData.receiptName}</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">✓ Attached</span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Description / Notes</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed justification or voucher particulars..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
            >
              Record Voucher
            </button>
          </div>
        </form>
      </Modal>

      {/* Bill Preview Modal */}
      {previewReceipt && (
        <Modal
          isOpen={!!previewReceipt}
          onClose={() => setPreviewReceipt(null)}
          title={`Bill Voucher Preview: ${previewReceipt.expenseCode}`}
          subtitle={previewReceipt.title}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4 shadow-xl">
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <p className="font-bold text-sm text-white">{previewReceipt.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Code: {previewReceipt.expenseCode}</p>
                </div>
                <ApprovalStatusBadge status={previewReceipt.status} />
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="font-semibold text-white">{previewReceipt.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expense Date:</span>
                  <span className="font-semibold text-white">{formatDate(previewReceipt.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paid By:</span>
                  <span className="font-semibold text-white">{previewReceipt.paidBy}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-semibold text-white">{previewReceipt.paymentMethod}</span>
                </div>
                {previewReceipt.vendor && (
                  <div className="flex justify-between">
                    <span>Vendor:</span>
                    <span className="font-semibold text-white">{previewReceipt.vendor}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-slate-400 font-semibold">Total Amount:</span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  {formatCurrency(previewReceipt.amount, sym)}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewReceipt(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
