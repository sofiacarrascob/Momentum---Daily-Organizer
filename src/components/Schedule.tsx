/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, CheckCircle2, Circle, Clock, Trash2, Edit2, Bell, AlertCircle, Calendar } from 'lucide-react';
import { Task } from '../types';
import { getTodayDateString, formatDateFriendly, getWeekDays, formatTimeFriendly } from '../utils/dateUtils';
import { getColorScheme, COLOR_SCHEMES } from '../utils/colorUtils';
import { Modal } from './Modal';

interface ScheduleProps {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  editTask: (id: string, updatedFields: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
}

export const Schedule: React.FC<ScheduleProps> = ({
  tasks,
  addTask,
  editTask,
  deleteTask,
  toggleTaskStatus,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [color, setColor] = useState('turquoise');
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:45');

  // Filter and sort tasks for the selected date
  const dateTasks = tasks
    .filter((t) => t.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  // Week days for calendar bar
  const weekDays = getWeekDays();

  // Reset form helper
  const resetForm = () => {
    setTitle('');
    setTime('09:00');
    setColor('turquoise');
    setHasReminder(false);
    setReminderTime('08:45');
    setEditingTask(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setTime(task.time);
    setColor(task.color);
    if (task.reminderTime) {
      setHasReminder(true);
      setReminderTime(task.reminderTime);
    } else {
      setHasReminder(false);
      setReminderTime('08:45');
    }
    setIsCreateOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      title: title.trim(),
      time,
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

    setIsCreateOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(id);
      if (editingTask?.id === id) {
        setIsCreateOpen(false);
        resetForm();
      }
    }
  };

  return (
    <div className="space-y-6" id="schedule-page">
      {/* Page Title & Add Button */}
      <div className="flex items-center justify-between" id="schedule-title-section">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 tracking-tight" id="schedule-title">
            Daily Schedule
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5" id="schedule-subtitle">
            {formatDateFriendly(selectedDate)}
          </p>
        </div>
        
        <button
          id="schedule-add-task-btn"
          onClick={handleOpenCreate}
          className="bg-turquoise-500 hover:bg-turquoise-600 text-white font-semibold text-sm px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all shadow-md shadow-turquoise-500/10 cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Task</span>
        </button>
      </div>

      {/* Week Calendar Bar (Structured Style) */}
      <div
        className="bg-neutral-50/50 border border-neutral-100 rounded-3xl p-3 flex justify-between gap-1 overflow-x-auto"
        id="schedule-week-bar"
      >
        {weekDays.map((day) => {
          const isSelected = day.dateStr === selectedDate;
          return (
            <button
              id={`week-day-btn-${day.dateStr}`}
              key={day.dateStr}
              onClick={() => setSelectedDate(day.dateStr)}
              className={`flex-1 min-w-[48px] flex flex-col items-center py-2.5 rounded-2xl transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white shadow-xs text-turquoise-600 font-bold border border-turquoise-100'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'
              }`}
            >
              <span className="text-2xs font-semibold uppercase tracking-wider mb-1">
                {day.dayName}
              </span>
              <span className={`text-base flex items-center justify-center w-8 h-8 rounded-full ${
                day.isToday && !isSelected
                  ? 'bg-orange-100 text-orange-600 font-bold'
                  : ''
              }`}>
                {day.dayNum}
              </span>
            </button>
          );
        })}
      </div>

      {/* Timeline Section */}
      <div className="relative pl-6 sm:pl-8 space-y-6" id="schedule-timeline">
        {/* Timeline vertical connector line */}
        {dateTasks.length > 0 && (
          <div className="absolute top-4 bottom-4 left-3.5 sm:left-[22px] w-0.5 bg-neutral-100" id="timeline-connecting-line" />
        )}

        <AnimatePresence mode="popLayout">
          {dateTasks.length > 0 ? (
            dateTasks.map((task) => {
              const isCompleted = task.status === 'Completed';
              const scheme = getColorScheme(task.color);

              return (
                <motion.div
                  id={`task-card-${task.id}`}
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  layout
                  className="relative group"
                >
                  {/* Timeline Node Bullet */}
                  <div
                    id={`task-node-${task.id}`}
                    className={`absolute -left-[19px] sm:-left-[23px] top-4 w-3.5 h-3.5 rounded-full border-2 bg-white transition-all ${
                      isCompleted ? 'border-turquoise-500 bg-turquoise-100/50' : `border-${task.color}-400`
                    }`}
                    style={{
                      borderColor: isCompleted
                        ? 'var(--color-turquoise-500)'
                        : `var(--color-${task.color === 'green' ? 'emerald' : task.color === 'pink' ? 'rose' : task.color}-500)`
                    }}
                  />

                  {/* Task Card Box */}
                  <div
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-3xl border transition-all gap-4 ${
                      isCompleted
                        ? 'bg-neutral-50/50 border-neutral-100 opacity-65'
                        : 'bg-white border-neutral-100 hover:border-neutral-200 hover:shadow-xs'
                    }`}
                  >
                    {/* Checkbox and Text Info */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <button
                        id={`task-toggle-${task.id}`}
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`mt-0.5 flex-shrink-0 cursor-pointer transition-colors p-0.5 rounded-full ${scheme.text}`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5.5 h-5.5 text-turquoise-500 fill-turquoise-50/20" />
                        ) : (
                          <Circle className="w-5.5 h-5.5 text-neutral-300 hover:text-turquoise-500" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`text-base font-semibold ${
                              isCompleted ? 'text-neutral-400 line-through font-normal' : 'text-neutral-800'
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.reminderTime && (
                            <span
                              id={`task-reminder-badge-${task.id}`}
                              className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full text-3xs font-bold uppercase tracking-wider"
                            >
                              <Bell size={10} />
                              <span>{task.reminderTime}</span>
                            </span>
                          )}
                        </div>

                        {/* Timing and details */}
                        <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1.5 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock size={13} className="text-neutral-400" />
                            <span>{formatTimeFriendly(task.time)}</span>
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
                          <span className={`px-2 py-0.5 rounded-md font-semibold text-2xs uppercase tracking-wider ${scheme.bg} ${scheme.text}`}>
                            {scheme.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons (Edit & Delete) */}
                    <div className="flex items-center gap-1 self-end sm:self-auto" id={`task-actions-${task.id}`}>
                      <button
                        id={`task-edit-btn-${task.id}`}
                        onClick={() => handleOpenEdit(task)}
                        className="p-2 rounded-xl text-neutral-400 hover:text-turquoise-600 hover:bg-turquoise-50 transition-colors cursor-pointer"
                        title="Edit task"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        id={`task-delete-btn-${task.id}`}
                        onClick={() => handleDelete(task.id)}
                        className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              id="schedule-empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-neutral-400 flex flex-col items-center justify-center gap-4 bg-neutral-50/30 rounded-3xl border border-dashed border-neutral-200"
            >
              <div className="bg-neutral-50 p-4 rounded-full text-neutral-400">
                <Calendar size={32} strokeWidth={1.5} />
              </div>
              <div className="max-w-xs">
                <p className="text-sm font-semibold text-neutral-600">No tasks for today</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Keep your focus clear! Design a simple flow for your day by scheduling a task.
                </p>
              </div>
              <button
                id="schedule-create-first-btn"
                onClick={handleOpenCreate}
                className="text-xs font-semibold bg-turquoise-500 hover:bg-turquoise-600 text-white px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm shadow-turquoise-500/10"
              >
                Schedule a Task
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider" htmlFor="task-title-input">
              Task Title
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              placeholder="e.g. Brainstorming Workshop"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3.5 text-neutral-800 font-semibold placeholder-neutral-400 focus:outline-hidden focus:border-turquoise-500 focus:ring-3 focus:ring-turquoise-500/10 transition-all text-sm"
            />
          </div>

          {/* Time Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider" htmlFor="task-time-input">
              Schedule Time
            </label>
            <div className="relative">
              <input
                id="task-time-input"
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3.5 text-neutral-800 font-semibold focus:outline-hidden focus:border-turquoise-500 focus:ring-3 focus:ring-turquoise-500/10 transition-all text-sm"
              />
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Accent Theme Color</label>
            <div className="flex gap-2.5 flex-wrap" id="task-color-selectors">
              {Object.keys(COLOR_SCHEMES).map((colorKey) => {
                const scheme = COLOR_SCHEMES[colorKey];
                const isSelected = color === colorKey;
                return (
                  <button
                    id={`task-color-btn-${colorKey}`}
                    key={colorKey}
                    type="button"
                    onClick={() => setColor(colorKey)}
                    className={`w-9 h-9 rounded-full cursor-pointer flex items-center justify-center border-2 transition-all ${
                      isSelected ? 'border-neutral-800 scale-108 shadow-sm' : 'border-transparent hover:scale-105'
                    } ${scheme.solidBg}`}
                    title={scheme.name}
                  >
                    {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Reminder Time */}
          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 space-y-3" id="task-reminder-panel">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={16} className={hasReminder ? 'text-orange-500' : 'text-neutral-400'} />
                <span className="text-xs font-semibold text-neutral-700">Receive reminder alert</span>
              </div>
              <button
                id="task-reminder-toggle"
                type="button"
                onClick={() => setHasReminder(!hasReminder)}
                className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${
                  hasReminder ? 'bg-turquoise-500' : 'bg-neutral-200'
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
                  className="space-y-1.5 pt-2"
                >
                  <label className="text-3xs font-bold text-neutral-400 uppercase tracking-wider" htmlFor="task-reminder-input">
                    Reminder Schedule Time
                  </label>
                  <input
                    id="task-reminder-input"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-neutral-800 font-semibold focus:outline-hidden focus:border-turquoise-500 transition-all text-xs"
                  />
                  <div className="flex items-start gap-1.5 text-neutral-400 text-3xs mt-1 leading-normal">
                    <AlertCircle size={10} className="text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>This schedules a virtual notification anchor which can be configured for future device support.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-2" id="task-form-actions">
            <button
              id="task-cancel-btn"
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-sm py-3.5 rounded-2xl transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              id="task-save-btn"
              type="submit"
              className="flex-1 bg-turquoise-500 hover:bg-turquoise-600 text-white font-semibold text-sm py-3.5 rounded-2xl transition-all shadow-sm shadow-turquoise-500/10 cursor-pointer text-center"
            >
              {editingTask ? 'Save Changes' : 'Schedule Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
