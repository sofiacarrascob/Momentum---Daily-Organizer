/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, Edit2, Trash2, Bell, Sparkles } from 'lucide-react';
import { Habit } from '../types';
import { getTodayDateString, getWeekDays } from '../utils/dateUtils';
import { getColorScheme, COLOR_SCHEMES } from '../utils/colorUtils';
import { HabitIcon, HABIT_ICONS } from './HabitIcon';
import { Modal } from './Modal';

interface HabitsProps {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'completedDates'>) => void;
  editHabit: (id: string, updatedFields: Partial<Omit<Habit, 'id' | 'completedDates'>>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (id: string, dateStr: string) => void;
}

export const Habits: React.FC<HabitsProps> = ({
  habits,
  addHabit,
  editHabit,
  deleteHabit,
  toggleHabitCompletion,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Droplet');
  const [color, setColor] = useState('turquoise');
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');

  const todayStr = getTodayDateString();
  const weekDays = getWeekDays();

  const resetForm = () => {
    setName('');
    setIcon('Droplet');
    setColor('turquoise');
    setHasReminder(false);
    setReminderTime('08:00');
    setEditingHabit(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setName(habit.name);
    setIcon(habit.icon);
    setColor(habit.color);
    if (habit.reminderTime) {
      setHasReminder(true);
      setReminderTime(habit.reminderTime);
    } else {
      setHasReminder(false);
      setReminderTime('08:00');
    }
    setIsCreateOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const habitData = {
      name: name.trim(),
      icon,
      color,
      reminderTime: hasReminder ? reminderTime : undefined,
    };

    if (editingHabit) {
      editHabit(editingHabit.id, habitData);
    } else {
      addHabit(habitData);
    }

    setIsCreateOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this habit? All completed days will be lost.')) {
      deleteHabit(id);
      if (editingHabit?.id === id) {
        setIsCreateOpen(false);
        resetForm();
      }
    }
  };

  return (
    <div className="space-y-6" id="habits-page">
      {/* Title Header */}
      <div className="flex items-center justify-between" id="habits-title-section">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 tracking-tight animate-fade-in" id="habits-title">
            Habit Builder
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5" id="habits-subtitle">
            Perform small steps daily to build lifelong routines.
          </p>
        </div>

        <button
          id="habits-add-habit-btn"
          onClick={handleOpenCreate}
          className="bg-turquoise-500 hover:bg-turquoise-600 text-white font-semibold text-sm px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all shadow-md shadow-turquoise-500/10 cursor-pointer"
        >
          <Plus size={16} />
          <span>New Habit</span>
        </button>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="habits-list-grid">
        <AnimatePresence mode="popLayout">
          {habits.length > 0 ? (
            habits.map((habit) => {
              const isDoneToday = habit.completedDates.includes(todayStr);
              const scheme = getColorScheme(habit.color);

              // Calculate habit stats
              const totalCompletions = habit.completedDates.length;

              return (
                <motion.div
                  id={`habit-card-${habit.id}`}
                  key={habit.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  layout
                  className="bg-white border border-neutral-100 rounded-3xl p-5 shadow-sm shadow-neutral-100 flex flex-col justify-between gap-5 group"
                >
                  {/* Top section: Icon, Name, Check-in Toggle */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Beautiful Icon Box */}
                      <div
                        id={`habit-icon-box-${habit.id}`}
                        className={`p-3.5 rounded-2xl flex-shrink-0 border transition-colors ${
                          isDoneToday ? scheme.bg : 'bg-neutral-50 border-neutral-100'
                        }`}
                        style={{
                          borderColor: isDoneToday ? 'transparent' : 'var(--color-neutral-100)',
                        }}
                      >
                        <HabitIcon
                          name={habit.icon}
                          className={`w-6 h-6 transition-transform ${
                            isDoneToday ? scheme.text : 'text-neutral-400 group-hover:scale-105'
                          }`}
                        />
                      </div>

                      {/* Name & Subtitle Info */}
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-neutral-800 truncate leading-snug">
                          {habit.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-2xs text-neutral-400 font-semibold uppercase tracking-wider mt-1">
                          <span>{totalCompletions} {totalCompletions === 1 ? 'day' : 'days'} done</span>
                          {habit.reminderTime && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-neutral-250" />
                              <span className="flex items-center gap-0.5 text-orange-500 font-bold">
                                <Bell size={10} />
                                {habit.reminderTime}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Check Action Button */}
                    <button
                      id={`habit-check-toggle-${habit.id}`}
                      onClick={() => toggleHabitCompletion(habit.id, todayStr)}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center border cursor-pointer transition-all ${
                        isDoneToday
                          ? `${scheme.solidBg} border-transparent shadow-md shadow-neutral-200`
                          : 'bg-white hover:bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                      }`}
                      title={isDoneToday ? 'Mark as incomplete for today' : 'Complete for today'}
                    >
                      <Check
                        className={`w-5 h-5 transition-transform ${
                          isDoneToday ? 'text-white stroke-[3]' : 'text-neutral-300 hover:text-neutral-500'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Middle Section: Weekly Habit Check-in Calendar */}
                  <div className="bg-neutral-50/50 rounded-2xl p-3 border border-neutral-100/50">
                    <p className="text-3xs font-bold text-neutral-400 uppercase tracking-wider mb-2.5 px-1">
                      Weekly Grid & History
                    </p>
                    <div className="flex justify-between gap-1" id={`habit-weekly-grid-${habit.id}`}>
                      {weekDays.map((day) => {
                        const isDoneOnDay = habit.completedDates.includes(day.dateStr);
                        const isDayToday = day.dateStr === todayStr;

                        return (
                          <button
                            id={`habit-${habit.id}-day-${day.dateStr}`}
                            key={day.dateStr}
                            onClick={() => toggleHabitCompletion(habit.id, day.dateStr)}
                            className={`flex-1 flex flex-col items-center py-1.5 rounded-xl cursor-pointer transition-all ${
                              isDoneOnDay
                                ? `${scheme.bg} ${scheme.text} font-bold`
                                : isDayToday
                                ? 'bg-neutral-100/50 text-neutral-600 font-semibold'
                                : 'text-neutral-400 hover:bg-neutral-100/50 hover:text-neutral-600'
                            }`}
                            title={`Toggle completion for ${day.dayName}`}
                          >
                            <span className="text-4xs font-bold uppercase tracking-wider mb-1">
                              {day.dayName.slice(0, 2)}
                            </span>
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center border-1.5 text-2xs ${
                                isDoneOnDay
                                  ? `${scheme.solidBg} border-transparent text-white`
                                  : 'border-neutral-250 bg-white text-neutral-500'
                              }`}
                            >
                              {isDoneOnDay ? (
                                <Check size={10} className="stroke-[3]" />
                              ) : (
                                day.dayNum
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom Actions: Edit / Delete */}
                  <div className="flex items-center justify-end gap-1.5 border-t border-neutral-50 pt-3 mt-1" id={`habit-actions-${habit.id}`}>
                    <button
                      id={`habit-edit-btn-${habit.id}`}
                      onClick={() => handleOpenEdit(habit)}
                      className="p-1.5 text-neutral-400 hover:text-turquoise-600 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
                      title="Edit Habit"
                    >
                      <Edit2 size={13.5} />
                    </button>
                    <button
                      id={`habit-delete-btn-${habit.id}`}
                      onClick={() => handleDelete(habit.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Habit"
                    >
                      <Trash2 size={13.5} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div
              className="col-span-full text-center py-16 text-neutral-400 flex flex-col items-center justify-center gap-4 bg-neutral-50/30 rounded-3xl border border-dashed border-neutral-200"
              id="habits-empty-state"
            >
              <div className="bg-neutral-50 p-4 rounded-full text-neutral-400 animate-pulse">
                <Sparkles size={32} strokeWidth={1.5} className="text-orange-500" />
              </div>
              <div className="max-w-xs">
                <p className="text-sm font-semibold text-neutral-600">Build Your First Habit</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Start small. Establish regular loops such as exercise, hydration, reading, or sleep patterns.
                </p>
              </div>
              <button
                id="habits-create-first-btn"
                onClick={handleOpenCreate}
                className="text-xs font-semibold bg-turquoise-500 hover:bg-turquoise-600 text-white px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-sm shadow-turquoise-500/10"
              >
                Create a Habit
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Habit Creation Overlay Modal */}
      <Modal
        idPrefix="habit-editor"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={editingHabit ? 'Edit Habit' : 'Create New Habit'}
      >
        <form onSubmit={handleSubmit} className="space-y-5" id="habit-editor-form">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider" htmlFor="habit-name-input">
              Habit Name
            </label>
            <input
              id="habit-name-input"
              type="text"
              required
              placeholder="e.g. Read Philosophy, Hydrate 3L"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3.5 text-neutral-800 font-semibold placeholder-neutral-400 focus:outline-hidden focus:border-turquoise-500 focus:ring-3 focus:ring-turquoise-500/10 transition-all text-sm"
            />
          </div>

          {/* Icon Selector Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Select Habit Icon</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 bg-neutral-50 p-3 rounded-2xl border border-neutral-100 max-h-[160px] overflow-y-auto" id="habit-icon-selector">
              {Object.keys(HABIT_ICONS).map((iconKey) => {
                const iconObj = HABIT_ICONS[iconKey as keyof typeof HABIT_ICONS];
                const IconComponent = iconObj.component;
                const isSelected = icon === iconKey;
                return (
                  <button
                    id={`habit-icon-btn-${iconKey}`}
                    key={iconKey}
                    type="button"
                    onClick={() => setIcon(iconKey)}
                    className={`p-3 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all gap-1 border ${
                      isSelected
                        ? 'bg-turquoise-500 border-transparent text-white scale-105 shadow-xs'
                        : 'bg-white hover:bg-neutral-50 border-neutral-200/60 text-neutral-500 hover:text-neutral-700'
                    }`}
                    title={iconObj.label}
                  >
                    <IconComponent size={20} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Accent Theme Color</label>
            <div className="flex gap-2.5 flex-wrap" id="habit-color-selectors">
              {Object.keys(COLOR_SCHEMES).map((colorKey) => {
                const scheme = COLOR_SCHEMES[colorKey];
                const isSelected = color === colorKey;
                return (
                  <button
                    id={`habit-color-btn-${colorKey}`}
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

          {/* Optional Daily Reminder */}
          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 space-y-3" id="habit-reminder-panel">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={16} className={hasReminder ? 'text-orange-500' : 'text-neutral-400'} />
                <span className="text-xs font-semibold text-neutral-700">Set daily alarm reminder</span>
              </div>
              <button
                id="habit-reminder-toggle"
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
                  id="habit-reminder-time-container"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1.5 pt-2"
                >
                  <label className="text-3xs font-bold text-neutral-400 uppercase tracking-wider" htmlFor="habit-reminder-input">
                    Reminder Alarm Time
                  </label>
                  <input
                    id="habit-reminder-input"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-neutral-800 font-semibold focus:outline-hidden focus:border-turquoise-500 transition-all text-xs"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2" id="habit-form-actions">
            <button
              id="habit-cancel-btn"
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-sm py-3.5 rounded-2xl transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              id="habit-save-btn"
              type="submit"
              className="flex-1 bg-turquoise-500 hover:bg-turquoise-600 text-white font-semibold text-sm py-3.5 rounded-2xl transition-all shadow-sm shadow-turquoise-500/10 cursor-pointer text-center"
            >
              {editingHabit ? 'Save Changes' : 'Build Habit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
