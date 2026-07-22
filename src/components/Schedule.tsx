/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Edit2,
  Bell,
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Timer,
} from 'lucide-react';
import { Task } from '../types';
import {
  getTodayDateString,
  formatDateFriendly,
  getWeekDays,
  formatTimeFriendly,
  calculateDurationFormatted,
  formatTaskTimeAndDuration,
  getTenMinutesBeforeTime,
  getIntelligentDefaultTimes,
  getRemainingWeekDays,
} from '../utils/dateUtils';
import { getColorScheme, COLOR_SCHEMES } from '../utils/colorUtils';
import { Modal } from './Modal';
import { WheelTimePickerField } from './WheelTimePicker';

interface ScheduleProps {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  editTask: (id: string, updatedFields: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
}

interface MonthDayCell {
  dateStr: string;
  dayNum: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasTasks: boolean;
}

const getMonthlyGrid = (viewMonth: Date, selectedDate: string, tasks: Task[]): MonthDayCell[] => {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // JavaScript getDay(): 0 = Sun, 1 = Mon ... 6 = Sat
  // Monday = 0, Tuesday = 1, ... Sunday = 6
  const firstDayIndex = firstDayOfMonth.getDay();
  const mondayOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const todayStr = getTodayDateString();
  const cells: MonthDayCell[] = [];

  const totalCells = mondayOffset + daysInMonth <= 35 ? 35 : 42;

  for (let i = 0; i < totalCells; i++) {
    let cellYear = year;
    let cellMonth = month;
    let dayNum = 1;
    let isCurrentMonth = true;

    if (i < mondayOffset) {
      isCurrentMonth = false;
      dayNum = daysInPrevMonth - mondayOffset + 1 + i;
      cellMonth = month - 1;
      if (cellMonth < 0) {
        cellMonth = 11;
        cellYear = year - 1;
      }
    } else if (i < mondayOffset + daysInMonth) {
      isCurrentMonth = true;
      dayNum = i - mondayOffset + 1;
    } else {
      isCurrentMonth = false;
      dayNum = i - (mondayOffset + daysInMonth) + 1;
      cellMonth = month + 1;
      if (cellMonth > 11) {
        cellMonth = 0;
        cellYear = year + 1;
      }
    }

    const mStr = String(cellMonth + 1).padStart(2, '0');
    const dStr = String(dayNum).padStart(2, '0');
    const dateStr = `${cellYear}-${mStr}-${dStr}`;

    cells.push({
      dateStr,
      dayNum,
      isCurrentMonth,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDate,
      hasTasks: tasks.some((t) => t.date === dateStr),
    });
  }

  return cells;
};

// Helper to add +1 hour to "HH:MM"
const getDefaultEndTime = (startTimeStr: string): string => {
  if (!startTimeStr) return '10:00';
  const [h, m] = startTimeStr.split(':').map(Number);
  const endH = (h + 1) % 24;
  return `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const Schedule: React.FC<ScheduleProps> = ({
  tasks,
  addTask,
  editTask,
  deleteTask,
  toggleTaskStatus,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Monthly Calendar navigation state
  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const [y, m] = getTodayDateString().split('-').map(Number);
    return new Date(y, m - 1, 1);
  });

  // Form State
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState('turquoise');
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:45');
  const [repeatRemainingDays, setRepeatRemainingDays] = useState(false);

  // Refs for auto-scroll
  const hourRowRefs = useRef<{ [hour: number]: HTMLDivElement | null }>({});

  // Filter and sort tasks for the selected date
  const dateTasks = useMemo(() => {
    return tasks
      .filter((t) => t.date === selectedDate)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [tasks, selectedDate]);

  // Timeline hours range: default 5:00 AM (5) to 11:00 PM (23), expanding earlier if early tasks exist
  const startHour = useMemo(() => {
    let minH = 5;
    for (const t of dateTasks) {
      if (!t.time) continue;
      const h = parseInt(t.time.split(':')[0], 10);
      if (!isNaN(h) && h < minH) {
        minH = h;
      }
    }
    return Math.max(0, minH);
  }, [dateTasks]);

  const VISIBLE_HOURS = useMemo(() => {
    return Array.from({ length: 24 - startHour }, (_, i) => startHour + i);
  }, [startHour]);

  // Automatically scroll to current hour when component mounts or selectedDate changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const now = new Date();
      let currentHour = now.getHours();

      if (currentHour < startHour) currentHour = startHour;
      if (currentHour > 23) currentHour = 23;

      const targetEl = hourRowRefs.current[currentHour];
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedDate, startHour]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleTodayReset = () => {
    const today = getTodayDateString();
    setSelectedDate(today);
    const [y, m] = today.split('-').map(Number);
    setViewMonth(new Date(y, m - 1, 1));
  };

  const handleSelectCalendarDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const [y, m] = dateStr.split('-').map(Number);
    if (y !== viewMonth.getFullYear() || m - 1 !== viewMonth.getMonth()) {
      setViewMonth(new Date(y, m - 1, 1));
    }
    // Auto-close calendar popover after selecting a date
    setIsCalendarOpen(false);
  };

  // Calculate monthly grid and week days
  const monthlyGrid = getMonthlyGrid(viewMonth, selectedDate, tasks);
  const weekDays = getWeekDays(selectedDate);

  // Task palette colors (Turquoise, Orange, Lavender, Sky Blue, Green, Soft Pink)
  const TASK_COLORS = ['turquoise', 'orange', 'lavender', 'skyblue', 'green', 'pink'];

  // Reset form helper
  const resetForm = () => {
    setTitle('');
    setTime('09:00');
    setEndTime('10:00');
    setColor('turquoise');
    setHasReminder(false);
    setReminderTime(getTenMinutesBeforeTime('09:00'));
    setRepeatRemainingDays(false);
    setEditingTask(null);
  };

  const handleStartTimeChange = (newStartTime: string) => {
    setTime(newStartTime);
    setEndTime(getDefaultEndTime(newStartTime));
    // Auto update reminder time to 10 minutes before start time if reminder is enabled
    if (hasReminder) {
      setReminderTime(getTenMinutesBeforeTime(newStartTime));
    }
  };

  const handleToggleReminder = () => {
    if (!hasReminder) {
      // Enabling reminder -> auto set reminder time to 10 minutes before task start time
      setReminderTime(getTenMinutesBeforeTime(time));
      setHasReminder(true);
    } else {
      setHasReminder(false);
    }
  };

  const handleOpenCreate = () => {
    resetForm();
    const defaults = getIntelligentDefaultTimes(selectedDate, tasks);
    setTime(defaults.startTime);
    setEndTime(defaults.endTime);
    setReminderTime(getTenMinutesBeforeTime(defaults.startTime));
    setIsCreateOpen(true);
  };

  const handleOpenCreateForHour = (hourNum: number) => {
    resetForm();
    const formattedStart = `${String(hourNum).padStart(2, '0')}:00`;
    const formattedEnd = `${String((hourNum + 1) % 24).padStart(2, '0')}:00`;
    setTime(formattedStart);
    setEndTime(formattedEnd);
    setReminderTime(getTenMinutesBeforeTime(formattedStart));
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setTime(task.time);
    setEndTime(task.endTime || getDefaultEndTime(task.time));
    setColor(task.color);
    setRepeatRemainingDays(false);
    if (task.reminderTime) {
      setHasReminder(true);
      setReminderTime(task.reminderTime);
    } else {
      setHasReminder(false);
      setReminderTime(getTenMinutesBeforeTime(task.time));
    }
    setIsCreateOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      title: title.trim(),
      time,
      endTime: endTime || undefined,
      color,
      status: (editingTask ? editingTask.status : 'Pending') as 'Pending' | 'Completed',
      date: selectedDate,
      reminderTime: hasReminder ? reminderTime : undefined,
    };

    if (editingTask) {
      editTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }

    if (repeatRemainingDays) {
      const remainingDays = getRemainingWeekDays(selectedDate);
      remainingDays.forEach((dateStr) => {
        addTask({
          ...taskData,
          date: dateStr,
          status: 'Pending',
        });
      });
    }

    setIsCreateOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
    if (editingTask?.id === id) {
      setIsCreateOpen(false);
      resetForm();
    }
  };

  // Duration preview in create/edit modal
  const liveDuration = calculateDurationFormatted(time, endTime);

  return (
    <div className="space-y-6" id="schedule-page">
      {/* Page Title & Action Buttons (Add Task + Calendar Popover Trigger) */}
      <div className="flex items-center justify-between gap-3" id="schedule-title-section">
        <div>
          <h1 className="text-2xl font-black text-[#301208] font-heading tracking-tight" id="schedule-title">
            Daily Schedule
          </h1>
          <p className="text-sm font-semibold text-[#68614E] mt-0.5" id="schedule-subtitle">
            {formatDateFriendly(selectedDate)}
          </p>
        </div>

        {/* Action Buttons: Add Task (+) & Calendar Icon Button */}
        <div className="flex items-center gap-2">
          <button
            id="schedule-add-task-btn"
            onClick={handleOpenCreate}
            className="bg-[#76DFCB] hover:bg-[#31ADAF] text-[#301208] font-bold text-sm px-4 py-2.5 rounded-2xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Add Task</span>
          </button>

          <button
            id="schedule-calendar-modal-trigger"
            onClick={() => setIsCalendarOpen(true)}
            className="bg-[#FAF7E8] hover:bg-[#F3EFE0] text-[#301208] border border-[#DFD8C4] p-2.5 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:border-[#31ADAF] active:scale-95"
            title="Open Monthly Calendar"
            aria-label="Open Monthly Calendar"
          >
            <CalendarIcon size={20} className="text-[#137B7C]" />
          </button>
        </div>
      </div>

      {/* 1. Weekly Calendar Bar (Preserved existing design, starting on Monday) */}
      <div
        className="bg-[#F3EFE0]/60 border border-[#DFD8C4]/60 rounded-2xl p-1.5 flex justify-between gap-1 overflow-x-auto select-none"
        id="schedule-week-bar"
      >
        {weekDays.map((day) => {
          const isSelected = day.dateStr === selectedDate;
          return (
            <button
              id={`week-day-btn-${day.dateStr}`}
              key={day.dateStr}
              onClick={() => setSelectedDate(day.dateStr)}
              className={`flex-1 min-w-[42px] flex flex-col items-center py-1.5 px-1 rounded-xl transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-[#76DFCB] text-[#301208] font-bold shadow-xs'
                  : 'text-[#68614E] hover:bg-[#FAF7E8] hover:text-[#301208]'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-[#301208]' : 'text-[#68614E]'}`}>
                {day.dayName}
              </span>
              <span className={`text-sm font-extrabold leading-none mt-1 ${isSelected ? 'text-[#301208]' : 'text-[#301208]'}`}>
                {day.dayNum}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Daily Timeline Schedule */}
      <div className="bg-white border border-[#DFD8C4]/80 rounded-3xl p-4 sm:p-6 shadow-2xs space-y-1" id="schedule-daily-timeline">
        <div className="flex items-center justify-between pb-3 border-b border-[#DFD8C4]/50 mb-3">
          <h2 className="text-base sm:text-lg font-black text-[#301208] font-heading tracking-tight flex items-center gap-2">
            <Clock size={18} className="text-[#137B7C]" />
            <span>Timeline</span>
          </h2>
          <span className="text-xs font-bold text-[#68614E]">
            {dateTasks.length} {dateTasks.length === 1 ? 'task' : 'tasks'} planned
          </span>
        </div>

        <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar" id="timeline-hours-container">
          {VISIBLE_HOURS.map((hour) => {
            const hourFormatted = String(hour).padStart(2, '0');
            const hourTasks = dateTasks.filter((t) => parseInt(t.time.split(':')[0], 10) === hour);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const display12 = hour % 12 === 0 ? 12 : hour % 12;

            return (
              <div
                key={hour}
                id={`timeline-hour-row-${hourFormatted}`}
                ref={(el) => {
                  hourRowRefs.current[hour] = el;
                }}
                className="flex items-start gap-2 sm:gap-4 group min-h-[42px] relative scroll-mt-20"
              >
                {/* Time Label Column */}
                <div className="w-14 sm:w-16 flex-shrink-0 flex flex-col items-end pr-2 pt-0.5 select-none">
                  <span className="text-xs font-black text-[#301208] font-mono leading-none">
                    {hourFormatted}:00
                  </span>
                  <span className="text-[10px] font-bold text-[#938C77] mt-0.5">
                    {display12} {ampm}
                  </span>
                </div>

                {/* Timeline slot connector */}
                <div className="flex-1 min-w-0 border-l-2 border-[#DFD8C4]/70 pl-3 sm:pl-4 py-0.5 relative group-hover:border-[#137B7C] transition-colors">
                  {/* Subtle hour divider line */}
                  <div className="absolute top-0 left-0 w-2 h-0.5 bg-[#DFD8C4]" />

                  {hourTasks.length > 0 ? (
                    <div className="space-y-1.5">
                      {hourTasks.map((task) => {
                        const isCompleted = task.status === 'Completed';
                        const scheme = getColorScheme(task.color);
                        const { timeDisplay, duration } = formatTaskTimeAndDuration(task.time, task.endTime);

                        return (
                          <div
                            key={task.id}
                            id={`timeline-task-${task.id}`}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl border transition-all gap-2 sm:gap-3 ${
                              isCompleted
                                ? 'bg-[#FAF7E8]/60 border-[#DFD8C4]/50 opacity-65'
                                : 'bg-white border-[#DFD8C4] hover:border-[#31ADAF] shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <button
                                id={`task-toggle-${task.id}`}
                                onClick={() => toggleTaskStatus(task.id)}
                                className="flex-shrink-0 cursor-pointer transition-colors p-0.5 rounded-full text-[#301208]"
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-4.5 h-4.5 text-[#137B7C] fill-[#76DFCB]/30" />
                                ) : (
                                  <Circle className="w-4.5 h-4.5 text-[#C2BBA7] hover:text-[#76DFCB]" />
                                )}
                              </button>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {/* Pure Color Dot Indicator (NO COLOR NAME TEXT) */}
                                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${scheme.solidBg}`} title="Task Accent Color" />

                                  <p
                                    className={`text-xs sm:text-sm font-extrabold ${
                                      isCompleted ? 'text-[#938C77] line-through font-normal' : 'text-[#301208]'
                                    }`}
                                  >
                                    {task.title}
                                  </p>

                                  {task.reminderTime && (
                                    <span
                                      id={`task-reminder-badge-${task.id}`}
                                      className="inline-flex items-center gap-1 bg-[#EF681E]/10 text-[#EF681E] px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                                    >
                                      <Bell size={10} />
                                      <span>{task.reminderTime}</span>
                                    </span>
                                  )}
                                </div>

                                {/* Time Range & Duration (No color name text) */}
                                <div className="flex items-center gap-2 text-xs text-[#68614E] mt-0.5 font-medium flex-wrap">
                                  <span className="flex items-center gap-1 font-bold text-[#301208]">
                                    <Clock size={12} className="text-[#137B7C]" />
                                    <span>{timeDisplay}</span>
                                  </span>

                                  {duration && (
                                    <>
                                      <span className="w-1 h-1 rounded-full bg-[#C2BBA7]" />
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#137B7C] bg-[#76DFCB]/20 px-2 py-0.5 rounded-md">
                                        <Timer size={11} />
                                        <span>{duration}</span>
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 self-end sm:self-auto" id={`task-actions-${task.id}`}>
                              <button
                                id={`task-edit-btn-${task.id}`}
                                onClick={() => handleOpenEdit(task)}
                                className="p-1.5 rounded-lg text-[#68614E] hover:text-[#137B7C] hover:bg-[#F3EFE0] transition-colors cursor-pointer"
                                title="Edit task"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                id={`task-delete-btn-${task.id}`}
                                onClick={() => handleDelete(task.id)}
                                className="p-1.5 rounded-lg text-[#68614E] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete task"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenCreateForHour(hour)}
                      className="w-full h-7 rounded-xl border border-dashed border-[#DFD8C4]/50 hover:border-[#31ADAF] hover:bg-[#FAF7E8]/80 text-[#938C77] hover:text-[#301208] text-xs font-semibold flex items-center justify-start px-2.5 transition-all cursor-pointer group/slot"
                    >
                      <Plus size={12} className="mr-1.5 opacity-60 group-hover/slot:opacity-100 group-hover/slot:scale-110 transition-all text-[#137B7C]" />
                      <span className="text-[11px] opacity-0 group-hover/slot:opacity-100 transition-opacity font-bold">Add task at {hourFormatted}:00</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Calendar Modal Popover */}
      <Modal
        idPrefix="monthly-calendar"
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        title="Select Date"
      >
        <div className="space-y-4" id="monthly-calendar-modal-body">
          {/* Calendar Navigation Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon size={18} className="text-[#137B7C]" />
              <h3 className="text-base font-black text-[#301208] font-heading" id="modal-calendar-month-title">
                {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
            </div>

            <div className="flex items-center gap-1">
              <button
                id="modal-calendar-prev-btn"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl border border-[#DFD8C4] bg-[#FAF7E8] text-[#301208] hover:bg-[#F3EFE0] transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                id="modal-calendar-today-btn"
                onClick={handleTodayReset}
                className="px-2.5 py-1 rounded-xl border border-[#DFD8C4] bg-[#FAF7E8] text-[11px] font-bold text-[#301208] hover:bg-[#F3EFE0] transition-colors cursor-pointer"
                title="Go to Today"
              >
                Today
              </button>
              <button
                id="modal-calendar-next-btn"
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl border border-[#DFD8C4] bg-[#FAF7E8] text-[#301208] hover:bg-[#F3EFE0] transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Days of Week Header (Beginning on Monday) */}
          <div className="grid grid-cols-7 text-center" id="modal-calendar-week-headers">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName) => (
              <div key={dayName} className="text-[11px] font-black text-[#68614E] uppercase tracking-wider py-1">
                {dayName}
              </div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-1.5" id="modal-calendar-days-grid">
            {monthlyGrid.map((cell, idx) => (
              <button
                key={`${cell.dateStr}-${idx}`}
                id={`modal-day-cell-${cell.dateStr}`}
                onClick={() => handleSelectCalendarDate(cell.dateStr)}
                className={`aspect-square h-10 flex flex-col items-center justify-center rounded-2xl text-xs transition-all relative cursor-pointer ${
                  cell.isSelected
                    ? 'bg-[#76DFCB] text-[#301208] font-black shadow-xs scale-102 border-1.5 border-[#31ADAF]'
                    : cell.isCurrentMonth
                    ? 'text-[#301208] font-bold hover:bg-[#FAF7E8]'
                    : 'text-[#C2BBA7] font-semibold hover:text-[#68614E] hover:bg-[#FAF7E8]/50'
                } ${cell.isToday && !cell.isSelected ? 'border border-[#EF681E] text-[#EF681E] font-black' : ''}`}
              >
                <span>{cell.dayNum}</span>
                {cell.hasTasks && (
                  <span
                    className={`w-1 h-1 rounded-full absolute bottom-1 ${
                      cell.isSelected ? 'bg-[#137B7C]' : 'bg-[#EF681E]'
                    }`}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Task Creation & Modification Drawer Modal */}
      <Modal
        idPrefix="task-editor"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={editingTask ? 'Edit Task' : 'Schedule New Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-5" id="task-editor-form">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#68614E] uppercase tracking-wider" htmlFor="task-title-input">
              Task Title
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              placeholder="e.g. Brainstorming Workshop"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#FAF7E8] border border-[#DFD8C4] rounded-2xl px-4 py-3.5 text-[#301208] font-bold placeholder-[#938C77] focus:outline-hidden focus:border-[#31ADAF] focus:ring-3 focus:ring-[#76DFCB]/20 transition-all text-sm"
            />
          </div>

          {/* Start & End Time Pickers + Live Duration Calculation */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <WheelTimePickerField
                idPrefix="task-start-time"
                label="Start Time"
                value={time}
                onChange={(newVal) => handleStartTimeChange(newVal)}
              />

              <WheelTimePickerField
                idPrefix="task-end-time"
                label="End Time"
                value={endTime}
                onChange={(newVal) => setEndTime(newVal)}
              />
            </div>

            {liveDuration && (
              <div className="flex items-center justify-between text-xs text-[#137B7C] bg-[#76DFCB]/20 px-3.5 py-2 rounded-xl font-bold border border-[#76DFCB]/40">
                <div className="flex items-center gap-1.5">
                  <Timer size={14} />
                  <span>Scheduled Duration</span>
                </div>
                <span className="font-mono text-sm font-black">{liveDuration}</span>
              </div>
            )}
          </div>

          {/* Color Selector - centered, minimal, circular swatches without heading text */}
          <div className="py-1 flex justify-center">
            <div className="flex items-center justify-center gap-3.5" id="task-color-selectors">
              {TASK_COLORS.map((colorKey) => {
                const scheme = COLOR_SCHEMES[colorKey];
                if (!scheme) return null;
                const isSelected = color === colorKey;
                return (
                  <button
                    id={`task-color-btn-${colorKey}`}
                    key={colorKey}
                    type="button"
                    onClick={() => setColor(colorKey)}
                    className={`w-9 h-9 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 relative ${
                      isSelected
                        ? 'ring-3 ring-offset-2 ring-[#301208] scale-110 shadow-xs'
                        : 'hover:scale-105 opacity-90 hover:opacity-100'
                    } ${scheme.solidBg}`}
                    title={scheme.name}
                    aria-label={`Select ${scheme.name} color`}
                  >
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2.5 h-2.5 rounded-full bg-white shadow-xs"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Reminder Time */}
          <div className="bg-[#FAF7E8] border border-[#DFD8C4] rounded-2xl p-4 space-y-3" id="task-reminder-panel">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={16} className={hasReminder ? 'text-[#EF681E]' : 'text-[#68614E]'} />
                <span className="text-xs font-bold text-[#301208]">Receive reminder alert</span>
              </div>
              <button
                id="task-reminder-toggle"
                type="button"
                onClick={handleToggleReminder}
                className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${
                  hasReminder ? 'bg-[#76DFCB]' : 'bg-[#DFD8C4]'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${
                    hasReminder ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <AnimatePresence>
              {hasReminder && (
                <motion.div
                  id="task-reminder-time-container"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2 pt-2"
                >
                  <WheelTimePickerField
                    idPrefix="task-reminder-time"
                    label="Reminder Schedule Time"
                    value={reminderTime}
                    onChange={(newVal) => setReminderTime(newVal)}
                  />
                  <div className="flex items-start gap-1.5 text-[#68614E] text-3xs mt-1 leading-normal">
                    <AlertCircle size={10} className="text-[#EF681E] mt-0.5 flex-shrink-0" />
                    <span>Schedules a virtual notification alert for this task.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Repeat for remaining days of this week toggle */}
          <div className="bg-[#FAF7E8] border border-[#DFD8C4] rounded-2xl p-4 space-y-1.5" id="task-repeat-panel">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon size={16} className={repeatRemainingDays ? 'text-[#137B7C]' : 'text-[#68614E]'} />
                <span className="text-xs font-bold text-[#301208]">Repeat for remaining days of this week</span>
              </div>
              <button
                id="task-repeat-toggle"
                type="button"
                onClick={() => setRepeatRemainingDays(!repeatRemainingDays)}
                className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${
                  repeatRemainingDays ? 'bg-[#76DFCB]' : 'bg-[#DFD8C4]'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${
                    repeatRemainingDays ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-[#68614E] font-medium leading-tight">
              Automatically creates this task on every remaining day of the current week (through Sunday).
            </p>
          </div>

          {/* Form Actions - Sticky Footer within Modal Scroll */}
          <div className="sticky -bottom-12 sm:-bottom-8 left-0 right-0 bg-white/95 backdrop-blur-md pt-3 pb-3 border-t border-[#DFD8C4]/60 flex items-center gap-3 z-30" id="task-form-actions">
            <button
              id="task-cancel-btn"
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="flex-1 bg-[#F3EFE0] hover:bg-[#E9E4D3] text-[#301208] font-bold text-sm py-3.5 rounded-2xl transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              id="task-save-btn"
              type="submit"
              className="flex-1 bg-[#76DFCB] hover:bg-[#31ADAF] text-[#301208] font-bold text-sm py-3.5 rounded-2xl transition-all shadow-md cursor-pointer text-center active:scale-98"
            >
              {editingTask ? 'Save Changes' : 'Schedule Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Floating Quick Add Button (FAB) */}
      <motion.button
        id="schedule-fab-add-btn"
        onClick={handleOpenCreate}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-20 right-5 sm:bottom-24 sm:right-8 z-30 w-14 h-14 rounded-full bg-[#76DFCB] hover:bg-[#31ADAF] text-[#301208] shadow-lg flex items-center justify-center border-2 border-white/80 cursor-pointer transition-colors focus:outline-hidden"
        title="Quick Add Task"
        aria-label="Quick Add Task"
      >
        <Plus size={26} strokeWidth={2.8} />
      </motion.button>
    </div>
  );
};
