import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Building2,
  Bell,
  CheckCircle2,
  Shield,
  UserCheck,
  Calculator,
  RotateCcw,
  Check,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  LogOut
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentRole,
    currentCompany,
    companies,
    switchCompany,
    notifications,
    markNotificationAsRead,
    clearNotifications,
    setActiveTab,
    resetAllDemoData,
    logout,
    currentUser,
    isMobileNavOpen,
    setIsMobileNavOpen
  } = useApp();

  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-50 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-2.5 sm:px-6 flex items-center justify-between shadow-xs max-w-full">
      {/* Left: Mobile Hamburger + Brand + Tenant Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-4 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
          aria-label="Toggle mobile menu"
        >
          {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <Sparkles className="w-4 h-4 text-indigo-100" />
          </div>
          <div className="hidden min-[380px]:block">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base">OmniStaff</span>
              <span className="hidden sm:inline text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                SaaS
              </span>
            </div>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-200 hidden md:block" />

        {/* Company Workspace Switcher */}
        <div className="relative shrink min-w-0">
          <button
            onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
            className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-semibold text-slate-700 max-w-full"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="max-w-[70px] min-[360px]:max-w-[95px] sm:max-w-[180px] truncate">{currentCompany.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {isCompanyDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-[90]"
                onClick={() => setIsCompanyDropdownOpen(false)}
              />
              <div className="absolute left-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-xs bg-white rounded-2xl shadow-2xl border border-slate-200 p-2.5 z-[100] animate-fade-in">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Workspace / Tenant
                </div>
                {companies.map(comp => (
                  <button
                    key={comp.id}
                    onClick={() => {
                      switchCompany(comp.id);
                      setIsCompanyDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      comp.id === currentCompany.id
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-left">
                      <p className="truncate font-semibold">{comp.name}</p>
                      <p className="text-[10px] text-slate-400 font-normal">
                        Basis: {comp.salaryCalculationBasis.replace('_', ' ')}
                      </p>
                    </div>
                    {comp.id === currentCompany.id && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Reset + Notification Center + User Profile + Logout */}
      <div className="flex items-center gap-1.5 sm:gap-3">

        {/* Reset Demo Data Button */}
        <button
          onClick={() => {
            if (confirm('Reset all demo data to default clean state?')) {
              resetAllDemoData();
            }
          }}
          title="Reset back to initial demo data"
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden lg:inline font-medium">Reset Demo</span>
        </button>

        {/* Notifications Center */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <>
              <div
                className="fixed inset-0 z-[90]"
                onClick={() => setIsNotifOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-3 z-[100] animate-fade-in">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={clearNotifications}
                  className="text-[11px] text-slate-400 hover:text-indigo-600 font-medium"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400">No notifications at this time.</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.linkTab) setActiveTab(n.linkTab);
                        setIsNotifOpen(false);
                      }}
                      className={`p-2.5 rounded-xl cursor-pointer text-left transition-colors border ${
                        n.read
                          ? 'bg-slate-50/50 border-slate-100 text-slate-600'
                          : 'bg-indigo-50/40 border-indigo-100 text-slate-900 hover:bg-indigo-50/80'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{n.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-snug">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            </>
          )}
        </div>

        {/* Active Role Avatar pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-200">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-[11px] sm:text-xs shadow-xs">
            {currentRole === 'owner' ? 'RS' : currentRole === 'supervisor' ? 'VP' : 'PN'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {currentUser?.name || (currentRole === 'owner' ? 'Rajesh Sharma' : currentRole === 'supervisor' ? 'Vikram Patel' : 'Priya Nair')}
            </p>
            <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">{currentRole}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Logout of application"
          className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
        >
          <LogOut className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>
      </div>
    </header>
  );
};
