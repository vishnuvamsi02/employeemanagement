import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { EmployeesView } from './views/EmployeesView';
import { AttendanceQuickView } from './views/AttendanceQuickView';
import { AttendanceGridView } from './views/AttendanceGridView';
import { LeavesView } from './views/LeavesView';
import { OvertimeView } from './views/OvertimeView';
import { AdvancesView } from './views/AdvancesView';
import { PayrollView } from './views/PayrollView';
import { ExpensesView } from './views/ExpensesView';
import { ApprovalsView } from './views/ApprovalsView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { AuditLogsView } from './views/AuditLogsView';
import { DatabaseSchemaView } from './views/DatabaseSchemaView';

const MainContent: React.FC = () => {
  const { activeTab, currentRole } = useApp();

  const renderActiveView = () => {
    // Role-based view protection
    if (currentRole === 'supervisor') {
      if (['payroll', 'advances', 'expenses', 'settings', 'audit_logs', 'db_schema'].includes(activeTab)) {
        return <DashboardView />;
      }
    } else if (currentRole === 'accountant') {
      if (['payroll', 'settings', 'audit_logs', 'db_schema'].includes(activeTab)) {
        return <DashboardView />;
      }
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'employees':
        return <EmployeesView />;
      case 'attendance_quick':
        return <AttendanceQuickView />;
      case 'attendance_grid':
        return <AttendanceGridView />;
      case 'leaves':
        return <LeavesView />;
      case 'overtime':
        return <OvertimeView />;
      case 'advances':
        return <AdvancesView />;
      case 'payroll':
        return <PayrollView />;
      case 'expenses':
        return <ExpensesView />;
      case 'approvals':
        return <ApprovalsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      case 'audit_logs':
        return <AuditLogsView />;
      case 'db_schema':
        return <DatabaseSchemaView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <main className="flex-1 min-w-0 bg-slate-50 p-2.5 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden w-full max-w-full">
      {renderActiveView()}
    </main>
  );
};

const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden w-full max-w-full">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 w-full max-w-full">
        <Navbar />
      </div>

      {/* Body Content Container */}
      <div className="flex flex-1 min-h-0 w-full max-w-full">
        <Sidebar />
        <MainContent />
      </div>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AuthenticatedApp />
    </AppProvider>
  );
}

export default App;
