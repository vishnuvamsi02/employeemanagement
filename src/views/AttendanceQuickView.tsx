import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AttendanceStatus } from '../types';
import { formatDate } from '../utils/formatters';
import {
  CalendarCheck2,
  CheckCircle2,
  Clock,
  Save,
  CheckCheck,
  Calendar,
  Sparkles,
  Info,
  User
} from 'lucide-react';

export const AttendanceQuickView: React.FC = () => {
  const { employees, attendances, bulkMarkAttendance, currentCompany, currentRole } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>('2025-08-25');
  const [attendanceState, setAttendanceState] = useState<
    Record<string, { status: AttendanceStatus; workingHours: number; overtimeHours: number; notes: string }>
  >({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load existing records for selected date or initialize
  useEffect(() => {
    const existing = attendances.filter(a => a.date === selectedDate);
    const stateMap: Record<
      string,
      { status: AttendanceStatus; workingHours: number; overtimeHours: number; notes: string }
    > = {};

    employees.forEach(emp => {
      const match = existing.find(a => a.employeeId === emp.id);
      if (match) {
        // If it was 'absent', map it gracefully to 'unpaid_leave' per new rule
        const mappedStatus = match.status === 'absent' ? 'unpaid_leave' : match.status;
        stateMap[emp.id] = {
          status: mappedStatus,
          workingHours: match.workingHours,
          overtimeHours: match.overtimeHours || 0,
          notes: match.notes || ''
        };
      } else {
        stateMap[emp.id] = {
          status: 'present',
          workingHours: currentCompany.standardWorkingHours,
          overtimeHours: 0,
          notes: ''
        };
      }
    });

    setAttendanceState(stateMap);
  }, [selectedDate, employees, attendances, currentCompany]);

  const handleStatusChange = (empId: string, status: AttendanceStatus) => {
    let hours = currentCompany.standardWorkingHours;
    if (status === 'half_day') hours = Math.round(currentCompany.standardWorkingHours / 2);
    if (['paid_leave', 'unpaid_leave', 'weekly_off', 'holiday'].includes(status)) hours = 0;

    setAttendanceState(prev => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        status,
        workingHours: hours
      }
    }));
  };

  const handleOvertimeChange = (empId: string, otHours: number) => {
    setAttendanceState(prev => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        overtimeHours: Math.max(0, otHours)
      }
    }));
  };

  const handleNotesChange = (empId: string, notes: string) => {
    setAttendanceState(prev => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        notes
      }
    }));
  };

  const handleMarkAllPresent = () => {
    const nextState = { ...attendanceState };
    employees.forEach(emp => {
      nextState[emp.id] = {
        ...nextState[emp.id],
        status: 'present',
        workingHours: currentCompany.standardWorkingHours
      };
    });
    setAttendanceState(nextState);
  };

  const handleSaveAttendance = () => {
    const recordsToSave = employees.map(emp => {
      const record = attendanceState[emp.id] || {
        status: 'present',
        workingHours: currentCompany.standardWorkingHours,
        overtimeHours: 0,
        notes: ''
      };

      return {
        companyId: currentCompany.id,
        employeeId: emp.id,
        date: selectedDate,
        status: record.status,
        workingHours: record.workingHours,
        overtimeHours: record.overtimeHours,
        notes: record.notes,
        markedBy: currentRole === 'supervisor' ? 'Vikram Patel (Supervisor)' : 'Rajesh Sharma (Owner)',
        markedAt: new Date().toISOString()
      };
    });

    bulkMarkAttendance(recordsToSave);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Metrics on current state (excluding absent)
  const counts = Object.values(attendanceState).reduce(
    (acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header Banner - Mobile Optimized */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Quick Attendance Entry</h2>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              1-Tap Mobile Action
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mark all employees quickly. Half Day, Paid Leave, and Unpaid Leave specify attendance type directly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 flex-1 sm:flex-initial">
            <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent focus:outline-none text-slate-900 font-bold w-full"
            />
          </div>

          <button
            onClick={handleMarkAllPresent}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors shadow-xs flex-1 sm:flex-initial"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Mark All Present</span>
          </button>

          <button
            onClick={handleSaveAttendance}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 w-full sm:w-auto"
          >
            <Save className="w-4 h-4 shrink-0" />
            <span>Save Register</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500 text-white flex items-center justify-between shadow-lg shadow-emerald-500/20 animate-fade-in text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Attendance register saved for {formatDate(selectedDate)}!</span>
          </div>
          <span className="text-[10px] opacity-90 hidden sm:inline">Auto-synced</span>
        </div>
      )}

      {/* Summary KPI Strip - Mobile 2x2 grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center">
          <p className="text-[11px] font-semibold text-slate-500">Total Workforce</p>
          <p className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">{employees.length}</p>
        </div>
        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
          <p className="text-[11px] font-semibold text-emerald-700">● Present</p>
          <p className="text-lg sm:text-xl font-bold text-emerald-950 mt-0.5">{counts['present'] || 0}</p>
        </div>
        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-center">
          <p className="text-[11px] font-semibold text-amber-700">◐ Half Day</p>
          <p className="text-lg sm:text-xl font-bold text-amber-950 mt-0.5">{counts['half_day'] || 0}</p>
        </div>
        <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 text-center">
          <p className="text-[11px] font-semibold text-sky-700">★ Paid / Unpaid</p>
          <p className="text-lg sm:text-xl font-bold text-sky-950 mt-0.5">
            {(counts['paid_leave'] || 0) + (counts['unpaid_leave'] || 0)}
          </p>
        </div>
      </div>

      {/* Mobile Card View (visible on mobile screens) */}
      <div className="block md:hidden space-y-3">
        {employees.map(emp => {
          const cur = attendanceState[emp.id] || {
            status: 'present',
            workingHours: currentCompany.standardWorkingHours,
            overtimeHours: 0,
            notes: ''
          };
          const isWhite = emp.employeeType === 'white_collar';

          return (
            <div
              key={emp.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3 transition-all"
            >
              {/* Employee Info Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/70 text-indigo-700 border border-indigo-200/60 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {emp.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-xs truncate">{emp.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      {emp.employeeCode} • {emp.designation}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isWhite ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {isWhite ? 'White-Collar' : 'Labour'}
                </span>
              </div>

              {/* Status Buttons: Present, Half Day, Paid Leave, Unpaid Leave */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Status Selection:
                  </span>
                  <span className="text-[10px] font-bold text-indigo-600 capitalize">
                    {cur.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(emp.id, 'present')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                      cur.status === 'present'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 ring-2 ring-emerald-600/20'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50/50 hover:border-emerald-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${cur.status === 'present' ? 'bg-white' : 'bg-emerald-500'}`} />
                    <span>Present (8h)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(emp.id, 'half_day')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                      cur.status === 'half_day'
                        ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30 ring-2 ring-amber-500/20'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50/50 hover:border-amber-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${cur.status === 'half_day' ? 'bg-white' : 'bg-amber-500'}`} />
                    <span>Half Day (4h)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(emp.id, 'paid_leave')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                      cur.status === 'paid_leave'
                        ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30 ring-2 ring-sky-600/20'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-sky-50/50 hover:border-sky-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${cur.status === 'paid_leave' ? 'bg-white' : 'bg-sky-500'}`} />
                    <span>Paid Leave</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(emp.id, 'unpaid_leave')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                      cur.status === 'unpaid_leave'
                        ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30 ring-2 ring-purple-600/20'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-purple-50/50 hover:border-purple-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${cur.status === 'unpaid_leave' ? 'bg-white' : 'bg-purple-500'}`} />
                    <span>Unpaid Leave</span>
                  </button>
                </div>
              </div>

              {/* Overtime & Notes Row */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    Overtime (Hours)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={16}
                    value={cur.overtimeHours || ''}
                    onChange={e => handleOvertimeChange(emp.id, parseFloat(e.target.value) || 0)}
                    placeholder="0 hrs"
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 text-center font-bold text-slate-900 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    Supervisor Note
                  </label>
                  <input
                    type="text"
                    value={cur.notes}
                    onChange={e => handleNotesChange(emp.id, e.target.value)}
                    placeholder="Optional remarks..."
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 text-slate-700 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-xs"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View (visible on tablet and desktop screens) */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[170px]">Employee</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[120px]">Category</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[370px]">Mark Status (1-Click)</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[80px]">Hours</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[110px]">Overtime (hrs)</th>
                <th className="py-3.5 px-4 min-w-[180px]">Supervisor Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map(emp => {
                const cur = attendanceState[emp.id] || {
                  status: 'present',
                  workingHours: currentCompany.standardWorkingHours,
                  overtimeHours: 0,
                  notes: ''
                };
                const isWhite = emp.employeeType === 'white_collar';

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Employee info */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {emp.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{emp.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {emp.employeeCode} • {emp.designation}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Employee Type Policy */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap inline-block ${
                          isWhite
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isWhite ? 'White-Collar' : 'Labour Worker'}
                      </span>
                    </td>

                    {/* Status Buttons: Present, Half Day, Paid Leave, Unpaid Leave */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 flex-nowrap">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(emp.id, 'present')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all inline-flex items-center gap-1 shrink-0 ${
                            cur.status === 'present'
                              ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          Present
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(emp.id, 'half_day')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all inline-flex items-center gap-1 shrink-0 ${
                            cur.status === 'half_day'
                              ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-500/30'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                        >
                          <span className="text-[10px] leading-none">◐</span>
                          Half Day
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(emp.id, 'paid_leave')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all inline-flex items-center gap-1 shrink-0 ${
                            cur.status === 'paid_leave'
                              ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-600/30'
                              : 'bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                          }`}
                        >
                          <span className="text-[10px] leading-none">★</span>
                          Paid Leave
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(emp.id, 'unpaid_leave')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all inline-flex items-center gap-1 shrink-0 ${
                            cur.status === 'unpaid_leave'
                              ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-600/30'
                              : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                          }`}
                        >
                          <span className="text-[9px] leading-none">▲</span>
                          Unpaid Leave
                        </button>
                      </div>
                    </td>

                    {/* Standard Hours */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-slate-700">{cur.workingHours} hrs</span>
                    </td>

                    {/* Overtime input */}
                    <td className="py-3 px-4 text-center">
                      <input
                        type="number"
                        min={0}
                        max={16}
                        step={1}
                        value={cur.overtimeHours || ''}
                        onChange={e => handleOvertimeChange(emp.id, parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-16 py-1 px-2 rounded-lg border border-slate-200 text-center font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </td>

                    {/* Notes */}
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={cur.notes}
                        onChange={e => handleNotesChange(emp.id, e.target.value)}
                        placeholder="Remarks..."
                        className="w-full py-1 px-2.5 rounded-lg border border-slate-200 text-slate-600 placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
