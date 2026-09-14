import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  ShieldCheck,
  Search,
  Filter,
  History,
  User,
  Activity,
  Layers,
  Clock
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  const modules = ['ALL', 'Attendance', 'Payroll', 'Leaves', 'Overtime', 'Advances', 'Expenses', 'Settings', 'Employees'];
  const roles = ['ALL', 'owner', 'supervisor', 'accountant'];

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.targetEntity && log.targetEntity.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMod = selectedModule === 'ALL' || log.module === selectedModule;
    const matchesRole = selectedRole === 'ALL' || log.userRole === selectedRole;

    return matchesSearch && matchesMod && matchesRole;
  });

  // Role stats
  const ownerActions = auditLogs.filter(l => l.userRole === 'owner').length;
  const supervisorActions = auditLogs.filter(l => l.userRole === 'supervisor').length;
  const accountantActions = auditLogs.filter(l => l.userRole === 'accountant').length;

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'supervisor':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'accountant':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getModuleBadge = (mod: string) => {
    switch (mod) {
      case 'Attendance':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Leaves':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Overtime':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Advances':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Expenses':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Payroll':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Employees':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Settings':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Activity & Governance Logs</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              Audit Trail (Dedicated DB Table)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete, immutable chronological record of who made changes, what modifications occurred, and exact timestamps across all system modules.
          </p>
        </div>
      </div>

      {/* KPI Overview Cards for Governance */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Logged Actions</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{auditLogs.length}</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Stored in activity_logs</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-indigo-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Owner Actions</span>
          <p className="text-2xl font-black text-indigo-950 mt-1">{ownerActions}</p>
          <span className="text-[10px] text-indigo-700 mt-0.5 block">Settings, advances, payroll</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Supervisor Actions</span>
          <p className="text-2xl font-black text-amber-950 mt-1">{supervisorActions}</p>
          <span className="text-[10px] text-amber-800 mt-0.5 block">Attendance, leaves, overtime</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Accountant Actions</span>
          <p className="text-2xl font-black text-emerald-950 mt-1">{accountantActions}</p>
          <span className="text-[10px] text-emerald-800 mt-0.5 block">Advances & expense vouchers</span>
        </div>
      </div>

      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by user name, action, modifications, or target entity..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="w-48">
          <select
            value={selectedModule}
            onChange={e => setSelectedModule(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-semibold bg-white focus:outline-none"
          >
            {modules.map(m => (
              <option key={m} value={m}>
                {m === 'ALL' ? 'All System Modules' : m}
              </option>
            ))}
          </select>
        </div>

        <div className="w-44">
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-semibold bg-white focus:outline-none capitalize"
          >
            {roles.map(r => (
              <option key={r} value={r}>
                {r === 'ALL' ? 'All User Roles' : `Role: ${r}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">Timestamp</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Performed By</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Role</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Module</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Action Event</th>
                <th className="py-3.5 px-4">Modification Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No matching activity logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900">{log.userName}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getRoleBadge(log.userRole)}`}>
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[10px] border ${getModuleBadge(log.module)}`}>
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{log.action}</span>
                        {log.targetEntity && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-mono">
                            {log.targetEntity}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xl">
                      <p className="leading-relaxed">{log.details}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
