import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AttendanceStatus } from '../types';
import { getMonthName, getDaysInMonth } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import { CalendarDays, Filter, ChevronLeft, ChevronRight, Info } from 'lucide-react';

export const AttendanceGridView: React.FC = () => {
  const { employees, attendances, markAttendance, currentCompany } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<string>('2025-08');
  const [filterDept, setFilterDept] = useState<string>('ALL');

  // Edit single day attendance modal
  const [activeCell, setActiveCell] = useState<{
    employeeId: string;
    employeeName: string;
    date: string;
    status: AttendanceStatus;
    hours: number;
    otHours: number;
    notes: string;
  } | null>(null);

  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthStr, 10) - 1;
  const daysCount = getDaysInMonth(year, monthIndex);

  const daysArray = Array.from({ length: daysCount }, (_, i) => i + 1);

  const filteredEmployees = employees.filter(e => filterDept === 'ALL' || e.department === filterDept);
  const departments: string[] = ['ALL', ...Array.from(new Set(employees.map(e => e.department)))];

  // Helper to get attendance record for employee on day
  const getRecord = (empId: string, day: number) => {
    const dayPadded = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `${selectedMonth}-${dayPadded}`;
    return attendances.find(a => a.employeeId === empId && a.date === dateStr);
  };

  const getStatusBadge = (status?: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">P</span>;
      case 'absent':
        return <span className="w-6 h-6 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px] flex items-center justify-center">A</span>;
      case 'half_day':
        return <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center justify-center">HD</span>;
      case 'paid_leave':
        return <span className="w-6 h-6 rounded-md bg-sky-100 text-sky-800 font-bold text-[10px] flex items-center justify-center">PL</span>;
      case 'unpaid_leave':
        return <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-800 font-bold text-[10px] flex items-center justify-center">UL</span>;
      case 'weekly_off':
        return <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-400 font-bold text-[10px] flex items-center justify-center">WO</span>;
      case 'holiday':
        return <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-800 font-bold text-[10px] flex items-center justify-center">H</span>;
      default:
        return <span className="w-6 h-6 rounded-md bg-slate-50 text-slate-300 text-[10px] flex items-center justify-center">-</span>;
    }
  };

  const handleCellClick = (emp: any, day: number) => {
    const dayPadded = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `${selectedMonth}-${dayPadded}`;
    const rec = getRecord(emp.id, day);

    setActiveCell({
      employeeId: emp.id,
      employeeName: emp.name,
      date: dateStr,
      status: rec?.status || 'present',
      hours: rec?.workingHours || 8,
      otHours: rec?.overtimeHours || 0,
      notes: rec?.notes || ''
    });
  };

  const handleSaveCell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCell) return;

    markAttendance({
      companyId: currentCompany.id,
      employeeId: activeCell.employeeId,
      date: activeCell.date,
      status: activeCell.status,
      workingHours: activeCell.hours,
      overtimeHours: activeCell.otHours,
      notes: activeCell.notes,
      markedBy: 'Supervisor Matrix Edit',
      markedAt: new Date().toISOString()
    });

    setActiveCell(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Matrix Controls */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Monthly Attendance Matrix</h2>
            <p className="text-xs text-slate-500">
              Interactive roster overview. Click any day cell to adjust status or record notes.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter */}
          <div className="w-44">
            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-700 font-semibold focus:outline-none"
            >
              {departments.map(d => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'All Departments' : d}
                </option>
              ))}
            </select>
          </div>

          {/* Month input */}
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex items-center gap-4 flex-wrap bg-white px-5 py-3 rounded-2xl border border-slate-200/80 text-xs font-semibold text-slate-600 shadow-xs">
        <span className="text-slate-400 font-bold uppercase text-[10px]">Legend:</span>
        <div className="flex items-center gap-1.5">{getStatusBadge('present')} <span>Present (P)</span></div>
        <div className="flex items-center gap-1.5">{getStatusBadge('absent')} <span>Absent (A)</span></div>
        <div className="flex items-center gap-1.5">{getStatusBadge('half_day')} <span>Half Day (HD)</span></div>
        <div className="flex items-center gap-1.5">{getStatusBadge('paid_leave')} <span>Paid Leave (PL)</span></div>
        <div className="flex items-center gap-1.5">{getStatusBadge('unpaid_leave')} <span>Unpaid Leave (UL)</span></div>
        <div className="flex items-center gap-1.5">{getStatusBadge('weekly_off')} <span>Weekly Off (WO)</span></div>
      </div>

      {/* Monthly Attendance Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-left sticky left-0 bg-slate-50 z-10 w-48 shadow-xs">
                  Employee
                </th>
                {daysArray.map(day => {
                  const d = new Date(year, monthIndex, day);
                  const isSun = d.getDay() === 0;
                  return (
                    <th
                      key={day}
                      className={`py-2 px-1 min-w-[32px] border-l border-slate-200/50 ${
                        isSun ? 'bg-slate-100 text-slate-400' : ''
                      }`}
                    >
                      <span className="block text-[10px] font-normal">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()]}</span>
                      <span className="font-bold text-slate-800">{day}</span>
                    </th>
                  );
                })}
                <th className="py-3 px-3 border-l border-slate-200 bg-slate-50 font-bold text-emerald-800">P</th>
                <th className="py-3 px-3 border-l border-slate-200 bg-slate-50 font-bold text-rose-800">A</th>
                <th className="py-3 px-3 border-l border-slate-200 bg-slate-50 font-bold text-amber-800">HD</th>
                <th className="py-3 px-3 border-l border-slate-200 bg-slate-50 font-bold text-sky-800">Leaves</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map(emp => {
                let pCount = 0;
                let aCount = 0;
                let hdCount = 0;
                let leaveCount = 0;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Fixed Left Header Column */}
                    <td className="py-3 px-4 text-left sticky left-0 bg-white shadow-xs z-10 border-r border-slate-200/80">
                      <p className="font-bold text-slate-900 truncate max-w-[140px]">{emp.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {emp.employeeCode} • {emp.employeeType === 'white_collar' ? 'White' : 'Labour'}
                      </p>
                    </td>

                    {/* Day Cells */}
                    {daysArray.map(day => {
                      const rec = getRecord(emp.id, day);
                      if (rec?.status === 'present') pCount++;
                      if (rec?.status === 'absent') aCount++;
                      if (rec?.status === 'half_day') hdCount++;
                      if (rec?.status === 'paid_leave' || rec?.status === 'unpaid_leave') leaveCount++;

                      return (
                        <td
                          key={day}
                          onClick={() => handleCellClick(emp, day)}
                          className="py-1 px-0.5 border-l border-slate-100 hover:bg-indigo-50/80 cursor-pointer transition-colors"
                          title={`${emp.name} on ${selectedMonth}-${day}: ${rec?.status || 'No record'}`}
                        >
                          <div className="flex items-center justify-center">{getStatusBadge(rec?.status)}</div>
                        </td>
                      );
                    })}

                    {/* Totals */}
                    <td className="py-2 px-3 border-l border-slate-200 font-bold text-emerald-700 bg-emerald-50/30">
                      {pCount}
                    </td>
                    <td className="py-2 px-3 border-l border-slate-200 font-bold text-rose-700 bg-rose-50/30">
                      {aCount}
                    </td>
                    <td className="py-2 px-3 border-l border-slate-200 font-bold text-amber-700 bg-amber-50/30">
                      {hdCount}
                    </td>
                    <td className="py-2 px-3 border-l border-slate-200 font-bold text-sky-700 bg-sky-50/30">
                      {leaveCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Single Attendance Entry Modal */}
      {activeCell && (
        <Modal
          isOpen={!!activeCell}
          onClose={() => setActiveCell(null)}
          title={`Attendance Record: ${activeCell.employeeName}`}
          subtitle={`Date: ${activeCell.date}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveCell} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Status</label>
              <select
                value={activeCell.status}
                onChange={e =>
                  setActiveCell({
                    ...activeCell,
                    status: e.target.value as AttendanceStatus,
                    hours: e.target.value === 'half_day' ? 4 : ['present'].includes(e.target.value) ? 8 : 0
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white"
              >
                <option value="present">● Present</option>
                <option value="absent">✕ Absent</option>
                <option value="half_day">◐ Half Day</option>
                <option value="paid_leave">★ Paid Leave</option>
                <option value="unpaid_leave">▲ Unpaid Leave</option>
                <option value="weekly_off">☕ Weekly Off</option>
                <option value="holiday">🎉 Holiday</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Working Hours</label>
                <input
                  type="number"
                  min={0}
                  max={24}
                  value={activeCell.hours}
                  onChange={e => setActiveCell({ ...activeCell, hours: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Overtime Hours</label>
                <input
                  type="number"
                  min={0}
                  max={16}
                  value={activeCell.otHours}
                  onChange={e => setActiveCell({ ...activeCell, otHours: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Notes / Reason</label>
              <textarea
                value={activeCell.notes}
                onChange={e => setActiveCell({ ...activeCell, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
                placeholder="Remarks, shift timing or supervisor notes..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveCell(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
              >
                Update Day
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
