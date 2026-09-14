import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  Clock,
  Banknote,
  DollarSign,
  Receipt,
  FileCheck2,
  BarChart3,
  Settings,
  ShieldAlert,
  Database,
  CalendarDays,
  Shield,
  UserCheck,
  Calculator,
  X
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentRole,
    currentUser,
    activeTab,
    setActiveTab,
    leaves,
    overtimes,
    advances,
    expenses,
    isMobileNavOpen,
    setIsMobileNavOpen
  } = useApp();

  const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
  const pendingOvertimes = overtimes.filter(o => o.status === 'pending').length;
  const pendingAdvances = advances.filter(a => a.status === 'pending').length;
  const pendingExpenses = expenses.filter(e => e.status === 'pending').length;

  const supervisorApprovals = pendingLeaves + pendingOvertimes;
  const accountantApprovals = pendingAdvances + pendingExpenses;
  const ownerApprovals = pendingLeaves + pendingOvertimes + pendingAdvances + pendingExpenses;

  // Role-based navigation items based on User Request
  const getNavItems = () => {
    switch (currentRole) {
      case 'supervisor':
        return [
          { id: 'dashboard', label: 'Supervisor Dashboard', icon: LayoutDashboard },
          { id: 'attendance_quick', label: 'Quick Attendance Entry', icon: CalendarCheck2, highlight: true },
          { id: 'attendance_grid', label: 'Attendance Calendar', icon: CalendarDays },
          { id: 'employees', label: 'Employees Directory', icon: Users },
          { id: 'leaves', label: 'Leave Requests', icon: Clock, badge: pendingLeaves },
          { id: 'overtime', label: 'Overtime Logging', icon: Clock, badge: pendingOvertimes },
          { id: 'approvals', label: 'Approvals (Leaves & OT)', icon: FileCheck2, badge: supervisorApprovals },
          { id: 'reports', label: 'Attendance Reports', icon: BarChart3 }
        ];

      case 'accountant':
        return [
          { id: 'dashboard', label: 'Accountant Dashboard', icon: LayoutDashboard },
          { id: 'expenses', label: 'Office & Employee Expenses', icon: Receipt, badge: pendingExpenses },
          { id: 'advances', label: 'Salary Advances', icon: Banknote, badge: pendingAdvances },
          { id: 'approvals', label: 'Approvals (Advances & Claims)', icon: FileCheck2, badge: accountantApprovals },
          { id: 'reports', label: 'Financial Reports', icon: BarChart3 }
        ];

      case 'owner':
      default:
        return [
          { id: 'dashboard', label: 'Owner Overview', icon: LayoutDashboard },
          { id: 'employees', label: 'Employees', icon: Users },
          { id: 'attendance_quick', label: 'Daily Attendance', icon: CalendarCheck2 },
          { id: 'attendance_grid', label: 'Monthly Matrix', icon: CalendarDays },
          { id: 'leaves', label: 'Leaves', icon: Clock, badge: pendingLeaves },
          { id: 'overtime', label: 'Overtime', icon: Clock, badge: pendingOvertimes },
          { id: 'advances', label: 'Salary Advances', icon: Banknote, badge: pendingAdvances },
          { id: 'payroll', label: 'Payroll Engine', icon: DollarSign, highlight: true },
          { id: 'expenses', label: 'Expenses', icon: Receipt, badge: pendingExpenses },
          { id: 'approvals', label: 'Approvals Hub', icon: FileCheck2, badge: ownerApprovals },
          { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
          { id: 'settings', label: 'Company Settings', icon: Settings },
          { id: 'audit_logs', label: 'Security & Audit Logs', icon: ShieldAlert },
          { id: 'db_schema', label: 'Database Schema', icon: Database, tag: 'SQL' }
        ];
    }
  };

  const navItems = getNavItems();

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileNavOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-[60] lg:hidden transition-opacity"
          onClick={() => setIsMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-[70] w-72 lg:w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 min-h-screen lg:min-h-[calc(100vh-4rem)] shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Drawer Header */}
        <div className="lg:hidden p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              {currentRole === 'owner' ? 'RS' : currentRole === 'supervisor' ? 'VP' : 'PN'}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-xs truncate">
                {currentUser?.name || (currentRole === 'owner' ? 'Rajesh Sharma' : currentRole === 'supervisor' ? 'Vikram Patel' : 'Priya Nair')}
              </p>
              <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider truncate">
                {currentRole === 'owner' ? 'Company Owner' : currentRole === 'supervisor' ? 'Site Supervisor' : 'Financial Accountant'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileNavOpen(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors shrink-0 cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      {/* Nav List */}
      <div className="p-3 sm:p-4 flex-1 space-y-1 overflow-y-auto">
        <div className="hidden lg:block px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation • <span className="capitalize text-indigo-600 font-extrabold">{currentRole}</span>
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.tag && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-indigo-600 border border-indigo-100'
                    }`}
                  >
                    {item.tag}
                  </span>
                )}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-white text-indigo-700' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Role Info Box */}
      <div className="p-3.5 border-t border-slate-100 m-3 bg-gradient-to-br from-indigo-50/50 to-slate-50 rounded-2xl border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-semibold text-slate-700">Indian Rupee (₹ INR)</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
          {currentRole === 'supervisor' && 'Supervisor mode: Salary details protected & hidden.'}
          {currentRole === 'accountant' && 'Accountant mode: Expenses & Advances access.'}
          {currentRole === 'owner' && 'Owner mode: Full platform governance & payroll access.'}
        </p>
      </div>
      </aside>
    </>
  );
};

export default Sidebar;
