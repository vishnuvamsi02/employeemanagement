import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Employee, EmployeeType } from '../types';
import { MetricCard } from '../components/common/MetricCard';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { EmployeeProfileModal } from './EmployeeProfileModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Building,
  Briefcase,
  Calendar,
  CreditCard,
  Check,
  AlertTriangle
} from 'lucide-react';

export const EmployeesView: React.FC = () => {
  const {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    setSelectedEmployeeId,
    currentCompany,
    canViewSalary
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | EmployeeType>('ALL');

  // Add / Edit Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form fields (incorporating all specification fields)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    fatherName: '',
    gender: 'Male',
    dob: '',
    maritalStatus: 'Single',
    religion: 'Hindu',
    epfUan: '',
    languagesKnown: '',
    qualification: '',
    experience: '',
    address: '',
    joiningDate: new Date().toISOString().split('T')[0],
    department: 'Manufacturing',
    designation: '',
    employeeType: 'white_collar' as EmployeeType,
    salary: 30000,
    salaryFrequency: 'monthly' as Employee['salaryFrequency'],
    employmentStatus: 'active' as Employee['employmentStatus'],
    paidLeaveAllowance: 12,
    overtimeEligible: true,
    overtimeRateMultiplier: 1.0,
    bankAccountName: '',
    bankAccountNumber: '',
    bankName: '',
    bankIfsc: '',
    notes: ''
  });

  const sym = currentCompany.currencySymbol;

  // Distinct departments
  const departments: string[] = ['ALL', ...Array.from(new Set(employees.map(e => e.department)))];

  // Filtering
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;
    const matchesType = selectedType === 'ALL' || emp.employeeType === selectedType;

    return matchesSearch && matchesDept && matchesType;
  });

  const whiteCollarCount = employees.filter(e => e.employeeType === 'white_collar').length;
  const blueCollarCount = employees.filter(e => e.employeeType === 'blue_collar').length;
  const totalPayrollBase = employees.reduce((acc, e) => acc + e.salary, 0);

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      fatherName: '',
      gender: 'Male',
      dob: '',
      maritalStatus: 'Single',
      religion: 'Hindu',
      epfUan: '',
      languagesKnown: '',
      qualification: '',
      experience: '',
      address: '',
      joiningDate: new Date().toISOString().split('T')[0],
      department: 'Manufacturing',
      designation: '',
      employeeType: 'white_collar',
      salary: 30000,
      salaryFrequency: 'monthly',
      employmentStatus: 'active',
      paidLeaveAllowance: 12,
      overtimeEligible: true,
      overtimeRateMultiplier: 1.0,
      bankAccountName: '',
      bankAccountNumber: '',
      bankName: '',
      bankIfsc: '',
      notes: ''
    });
    setEditingEmployee(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      phone: emp.phone,
      email: emp.email,
      fatherName: emp.fatherName || '',
      gender: emp.gender || 'Male',
      dob: emp.dob || '',
      maritalStatus: emp.maritalStatus || 'Single',
      religion: emp.religion || 'Hindu',
      epfUan: emp.epfUan || '',
      languagesKnown: emp.languagesKnown || '',
      qualification: emp.qualification || '',
      experience: emp.experience || '',
      address: emp.address,
      joiningDate: emp.joiningDate,
      department: emp.department,
      designation: emp.designation,
      employeeType: emp.employeeType,
      salary: emp.salary,
      salaryFrequency: emp.salaryFrequency,
      employmentStatus: emp.employmentStatus,
      paidLeaveAllowance: emp.paidLeaveAllowance,
      overtimeEligible: emp.overtimeEligible,
      overtimeRateMultiplier: emp.overtimeRateMultiplier || 1.0,
      bankAccountName: emp.bankDetails.accountName,
      bankAccountNumber: emp.bankDetails.accountNumber,
      bankName: emp.bankDetails.bankName,
      bankIfsc: emp.bankDetails.ifscOrRouting,
      notes: emp.notes || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingEmployee) {
      updateEmployee({
        ...editingEmployee,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        fatherName: formData.fatherName,
        gender: formData.gender,
        dob: formData.dob,
        maritalStatus: formData.maritalStatus,
        religion: formData.religion,
        epfUan: formData.epfUan,
        languagesKnown: formData.languagesKnown,
        qualification: formData.qualification,
        experience: formData.experience,
        address: formData.address,
        joiningDate: formData.joiningDate,
        department: formData.department,
        designation: formData.designation,
        employeeType: formData.employeeType,
        salary: Number(formData.salary),
        salaryFrequency: formData.salaryFrequency,
        employmentStatus: formData.employmentStatus,
        paidLeaveAllowance: formData.employeeType === 'blue_collar' ? 0 : Number(formData.paidLeaveAllowance),
        overtimeEligible: formData.overtimeEligible,
        overtimeRateMultiplier: Number(formData.overtimeRateMultiplier),
        bankDetails: {
          accountName: formData.bankAccountName || formData.name,
          accountNumber: formData.bankAccountNumber,
          bankName: formData.bankName,
          ifscOrRouting: formData.bankIfsc
        },
        notes: formData.notes
      });
    } else {
      addEmployee({
        companyId: currentCompany.id,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        fatherName: formData.fatherName,
        gender: formData.gender,
        dob: formData.dob,
        maritalStatus: formData.maritalStatus,
        religion: formData.religion,
        epfUan: formData.epfUan,
        languagesKnown: formData.languagesKnown,
        qualification: formData.qualification,
        experience: formData.experience,
        address: formData.address,
        joiningDate: formData.joiningDate,
        department: formData.department,
        designation: formData.designation,
        employeeType: formData.employeeType,
        salary: Number(formData.salary),
        salaryFrequency: formData.salaryFrequency,
        employmentStatus: formData.employmentStatus,
        paidLeaveAllowance: formData.employeeType === 'blue_collar' ? 0 : Number(formData.paidLeaveAllowance),
        usedPaidLeaves: 0,
        overtimeEligible: formData.overtimeEligible,
        overtimeRateMultiplier: Number(formData.overtimeRateMultiplier),
        bankDetails: {
          accountName: formData.bankAccountName || formData.name,
          accountNumber: formData.bankAccountNumber,
          bankName: formData.bankName,
          ifscOrRouting: formData.bankIfsc
        },
        notes: formData.notes,
        avatarUrl: `https://images.unsplash.com/photo-${formData.employeeType === 'white_collar' ? '1507003211169-0a1dd7228f2d' : '1500648767791-00dcc994a43e'}?w=150`
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 360 Dossier Modal Component */}
      <EmployeeProfileModal />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Headcount"
          value={employees.length}
          subtitle="Active on company register"
          icon={<Users className="w-5 h-5" />}
          color="indigo"
        />
        <MetricCard
          title="White-Collar Staff"
          value={whiteCollarCount}
          subtitle="Office staff with paid leaves"
          icon={<Briefcase className="w-5 h-5" />}
          color="sky"
        />
        <MetricCard
          title="Labour Workers"
          value={blueCollarCount}
          subtitle="Blue-collar (absence = daily cut)"
          icon={<Building className="w-5 h-5" />}
          color="amber"
        />
        {canViewSalary ? (
          <MetricCard
            title="Monthly Base Payroll"
            value={formatCurrency(totalPayrollBase, sym)}
            subtitle={`Avg: ${formatCurrency(Math.round(totalPayrollBase / (employees.length || 1)), sym)} / worker`}
            icon={<CreditCard className="w-5 h-5" />}
            color="emerald"
          />
        ) : (
          <MetricCard
            title="Total Departments"
            value={departments.length - 1}
            subtitle="Manufacturing, Operations & Sales"
            icon={<Building className="w-5 h-5" />}
            color="emerald"
          />
        )}
      </div>

      {/* Action Header & Filters */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Employee Directory</h2>
            <p className="text-xs text-slate-500">
              Manage white-collar professionals and blue-collar labour workforce with distinct policies
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 pt-3 border-t border-slate-100">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, employee code, designation..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedType === 'ALL' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({employees.length})
            </button>
            <button
              onClick={() => setSelectedType('white_collar')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedType === 'white_collar'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              White-Collar ({whiteCollarCount})
            </button>
            <button
              onClick={() => setSelectedType('blue_collar')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedType === 'blue_collar'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Labour ({blueCollarCount})
            </button>
          </div>

          {/* Department Select */}
          <div className="w-full md:w-48">
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'ALL' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Employee Card List */}
      <div className="block md:hidden space-y-3">
        {filteredEmployees.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-400 text-xs">
            No employees matching filter criteria.
          </div>
        ) : (
          filteredEmployees.map(emp => {
            const isWhiteCollar = emp.employeeType === 'white_collar';
            const remainingLeaves = isWhiteCollar ? Math.max(0, emp.paidLeaveAllowance - emp.usedPaidLeaves) : 0;

            return (
              <div
                key={emp.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3 hover:border-indigo-300 transition-all cursor-pointer"
                onClick={() => setSelectedEmployeeId(emp.id)}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={emp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={emp.name}
                      className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs truncate">{emp.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">
                        {emp.employeeCode} • {emp.designation}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {emp.employmentStatus}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block">Department</span>
                    <span className="font-bold text-slate-800 text-xs truncate block">{emp.department}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block">Category</span>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mt-0.5 ${
                      isWhiteCollar ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {isWhiteCollar ? 'White-Collar' : 'Labour'}
                    </span>
                  </div>

                  {canViewSalary && (
                    <div className="pt-1.5 border-t border-slate-200/60 col-span-2 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-500">Base Salary:</span>
                      <span className="font-extrabold text-indigo-700 text-sm">{formatCurrency(emp.salary, sym)} / month</span>
                    </div>
                  )}
                </div>

                {/* Quota & Overtime info */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Leave Quota:</span>
                  <span className="font-semibold text-slate-700">
                    {isWhiteCollar ? `${remainingLeaves} of ${emp.paidLeaveAllowance} days` : 'Labour (No Paid Quota)'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setSelectedEmployeeId(emp.id)}
                    className="flex-1 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs text-center border border-indigo-200 transition-colors"
                  >
                    360° Profile
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(emp)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-xs text-center transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Employee Table */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Role & Dept</th>
                <th className="py-3.5 px-4">Category Policy</th>
                {canViewSalary && <th className="py-3.5 px-4">Base Salary</th>}
                <th className="py-3.5 px-4">Paid Leave Quota</th>
                <th className="py-3.5 px-4">{canViewSalary ? 'Overtime Rate' : 'Overtime Eligibility'}</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={canViewSalary ? 8 : 7} className="py-12 text-center text-slate-400">
                    No employees matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => {
                  const isWhiteCollar = emp.employeeType === 'white_collar';
                  const remainingLeaves = isWhiteCollar ? Math.max(0, emp.paidLeaveAllowance - emp.usedPaidLeaves) : 0;

                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-indigo-50/30 transition-colors group cursor-pointer"
                      onClick={() => setSelectedEmployeeId(emp.id)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={emp.name}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {emp.name}
                            </p>
                            <p className="text-[11px] font-mono text-slate-400">{emp.employeeCode}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{emp.designation}</p>
                        <p className="text-[11px] text-slate-500">{emp.department}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded ${
                            isWhiteCollar
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isWhiteCollar ? 'White-Collar' : 'Labour Worker'}
                        </span>
                      </td>

                      {canViewSalary && (
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{formatCurrency(emp.salary, sym)}</p>
                          <p className="text-[10px] text-slate-400">
                            {formatCurrency(emp.salary / 30, sym)}/day
                          </p>
                        </td>
                      )}

                      <td className="py-3.5 px-4">
                        {isWhiteCollar ? (
                          <div>
                            <span className="font-semibold text-emerald-700">{remainingLeaves} left</span>
                            <span className="text-slate-400 text-[10px]"> / {emp.paidLeaveAllowance} total</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No Quota (Daily Cut)</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {emp.overtimeEligible ? (
                          canViewSalary ? (
                            <span className="text-slate-700 font-medium">
                              {formatCurrency(emp.salary / 30 / 8, sym)}/hr ({emp.overtimeRateMultiplier || 1.0}x)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Eligible ({emp.overtimeRateMultiplier || 1.0}x)
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400">Ineligible</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {emp.employmentStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedEmployeeId(emp.id)}
                            title="View 360 Dossier"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(emp)}
                            title="Edit Employee"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove employee ${emp.name} from records?`)) {
                                deleteEmployee(emp.id);
                              }
                            }}
                            title="Remove Employee"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingEmployee ? `Edit Employee: ${editingEmployee.name}` : 'Onboard New Employee'}
        subtitle="Complete personal profile, statutory identifiers, education, category policy and bank details"
        maxWidth="4xl"
      >
        <form onSubmit={handleSaveEmployee} className="space-y-5 text-xs max-h-[75vh] overflow-y-auto pr-1">
          {/* Section 1: Personal & Statutory Identity */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              Personal Details & Statutory Identity
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  placeholder="e.g. Rajesh Sharma"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Father's Name</label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  placeholder="e.g. Ramakant Sharma"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={e => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Marital Status</label>
                <select
                  value={formData.maritalStatus}
                  onChange={e => setFormData({ ...formData, maritalStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Religion</label>
                <input
                  type="text"
                  value={formData.religion}
                  onChange={e => setFormData({ ...formData, religion: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  placeholder="e.g. Hindu"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Residential Details */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-600"></span>
              Contact & Residential Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mobile / Phone Number *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  placeholder="+91 98201 44521"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email ID</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  placeholder="name@company.in"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Residential Address</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                placeholder="House / Flat No, Street, Landmark, City, State, PIN code"
              />
            </div>
          </div>

          {/* Section 3: Statutory, Education & Professional Background */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              Statutory, Education & Background
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Existing EPF UAN No</label>
                <input
                  type="text"
                  value={formData.epfUan}
                  onChange={e => setFormData({ ...formData, epfUan: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-mono"
                  placeholder="e.g. 100902849120 (12 digits)"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Languages Known</label>
                <input
                  type="text"
                  value={formData.languagesKnown}
                  onChange={e => setFormData({ ...formData, languagesKnown: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  placeholder="e.g. Hindi, English, Marathi"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Educational Qualification</label>
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  placeholder="e.g. B.Tech / Diploma / ITI Welder / High School"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Relevant Experience</label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={e => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  placeholder="e.g. 5 Years CNC Machining / Fresher"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Employment & Category Policy */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              Employment & Category Policy
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Employee Category Policy *</label>
                <select
                  value={formData.employeeType}
                  onChange={e => {
                    const type = e.target.value as EmployeeType;
                    setFormData({
                      ...formData,
                      employeeType: type,
                      paidLeaveAllowance: type === 'blue_collar' ? 0 : 12
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium"
                >
                  <option value="white_collar">White-Collar (Office Staff / Paid Leaves)</option>
                  <option value="blue_collar">Labour Worker / Blue-Collar (Daily Wage Deduction on Absence)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  placeholder="e.g. Shop Floor / Manufacturing"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={e => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  placeholder="e.g. CNC Operator / Supervisor"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Joining Date</label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Paid Leave Allowance</label>
                <input
                  type="number"
                  disabled={formData.employeeType === 'blue_collar'}
                  value={formData.paidLeaveAllowance}
                  onChange={e => setFormData({ ...formData, paidLeaveAllowance: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 bg-white"
                />
                {formData.employeeType === 'blue_collar' && (
                  <p className="text-[10px] text-amber-600 mt-1">Labour has 0 paid quota per Section 2.</p>
                )}
              </div>
            </div>

            {canViewSalary && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Base Monthly Salary ({sym}) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.salary}
                  onChange={e => setFormData({ ...formData, salary: Number(e.target.value) })}
                  className="w-full sm:w-1/2 px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold bg-white"
                />
              </div>
            )}

            {/* Overtime Eligibility */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Overtime Compensation</p>
                <p className="text-[11px] text-slate-500">Enable automatic hourly overtime calculations</p>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.overtimeEligible}
                  onChange={e => setFormData({ ...formData, overtimeEligible: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                Eligible
              </label>
            </div>
          </div>

          {/* Section 5: Bank & Disbursal Information */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              Bank & Disbursal Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-600 block mb-0.5 font-semibold">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  placeholder="e.g. HDFC Bank"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-0.5 font-semibold">Account Number</label>
                <input
                  type="text"
                  value={formData.bankAccountNumber}
                  onChange={e => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono bg-white"
                  placeholder="e.g. 50100..."
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-0.5 font-semibold">IFSC Code</label>
                <input
                  type="text"
                  value={formData.bankIfsc}
                  onChange={e => setFormData({ ...formData, bankIfsc: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono bg-white"
                  placeholder="e.g. HDFC0000240"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
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
              {editingEmployee ? 'Update Profile' : 'Create Profile'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
