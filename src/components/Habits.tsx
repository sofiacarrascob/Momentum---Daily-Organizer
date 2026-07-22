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
import { WheelTimePickerField } from './WheelTimePicker';

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
    deleteHabit(id);
    if (editingHabit?.id === id) {
      setIsCreateOpen(false);
      resetForm();
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5" id="habits-list-grid">
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
                  className="bg-white border border-[#DFD8C4]/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs hover:border-[#31ADAF]/40 transition-all flex flex-col justify-between gap-2.5 group"
                >
                  {/* Top section: Icon, Name, Actions, Check-in Toggle */}
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Icon Box */}
                      <div
                        id={`habit-icon-box-${habit.id}`}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors ${
                          isDoneToday ? 'bg-[#76DFCB] border-[#31ADAF] text-[#301208]' : 'bg-[#FAF7E8] border-[#DFD8C4] text-[#68614E]'
                        }`}
                      >
                        <HabitIcon
                          name={habit.icon}
                          className="w-5 h-5 transition-transform group-hover:scale-105"
                        />
                      </div>

                      {/* Name & Subtitle Info */}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-extrabold text-[#301208] truncate leading-tight font-heading">
                          {habit.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#68614E] mt-0.5">
                          <span>{totalCompletions} {totalCompletions === 1 ? 'day' : 'days'} done</span>
                          {habit.reminderTime && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-[#C2BBA7]" />
                              <span className="flex items-center gap-0.5 text-[#EF681E] font-bold">
                                <Bell size={10} />
                                {habit.reminderTime}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Edit, Delete & Check Action Buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        id={`habit-edit-btn-${habit.id}`}
                        onClick={() => handleOpenEdit(habit)}
                        className="p-1.5 text-[#68614E] hover:text-[#137B7C] rounded-lg hover:bg-[#F3EFE0] transition-colors cursor-pointer"
                        title="Edit Habit"
                      >
                        <Edit2 size={13.5} />
                      </button>
                      <button
                        id={`habit-delete-btn-${habit.id}`}
                        onClick={() => handleDelete(habit.id)}
                        className="p-1.5 text-[#68614E] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Habit"
                      >
                        <Trash2 size={13.5} />
                      </button>

                      <button
                        id={`habit-check-toggle-${habit.id}`}
                        onClick={() => toggleHabitCompletion(habit.id, todayStr)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border cursor-pointer transition-all ml-1 ${
                          isDoneToday
                            ? 'bg-[#76DFCB] border-[#31ADAF] text-[#301208] shadow-xs'
                            : 'bg-white hover:bg-[#FAF7E8] border-[#DFD8C4] hover:border-[#31ADAF]'
                        }`}
                        title={isDoneToday ? 'Mark as incomplete for today' : 'Complete for today'}
                      >
                        <Check
                          className={`w-5 h-5 transition-transform ${
                            isDoneToday ? 'text-[#301208] stroke-[3]' : 'text-[#C2BBA7] hover:text-[#68614E]'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Middle Section: Compact Weekly Habit Check-in Grid */}
                  <div className="bg-[#F3EFE0]/60 rounded-xl p-1.5 sm:p-2 border border-[#DFD8C4]/60">
                    <div className="flex justify-between gap-1" id={`habit-weekly-grid-${habit.id}`}>
                      {weekDays.map((day) => {
                        const isDoneOnDay = habit.completedDates.includes(day.dateStr);
                        const isDayToday = day.dateStr === todayStr;

                        return (
                          <button
                            id={`habit-${habit.id}-day-${day.dateStr}`}
                            key={day.dateStr}
                            onClick={() => toggleHabitCompletion(habit.id, day.dateStr)}
                            className={`flex-1 flex flex-col items-center py-1 px-0.5 rounded-lg cursor-pointer transition-all ${
                              isDoneOnDay
                                ? 'bg-[#76DFCB] text-[#301208] font-bold'
                                : isDayToday
                                ? 'bg-[#FAF7E8] text-[#301208] font-extrabold border border-[#EF681E]/40'
                                : 'text-[#68614E] hover:bg-[#FAF7E8] hover:text-[#301208]'
                            }`}
                            title={`Toggle completion for ${day.dayName}`}
                          >
                            <span className="text-[9px] font-extrabold uppercase tracking-wider mb-0.5">
                              {day.dayName.slice(0, 2)}
                            </span>
                            <div
                              className={`w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                                isDoneOnDay
                                  ? 'bg-[#137B7C] text-[#FEFBEC]'
                                  : 'bg-white text-[#301208] border border-[#DFD8C4]'
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
                </motion.div>
              );
            })
          ) : (
            <div
              className="col-span-full text-center py-12 px-6 text-[#68614E] flex flex-col items-center justify-center gap-4 bg-[#FAF7E8]/50 rounded-3xl border border-dashed border-[#DFD8C4]"
              id="habits-empty-state"
            >
              <div className="bg-[#FEFBEC] p-3.5 rounded-2xl text-[#EF681E] shadow-2xs border border-[#DFD8C4]">
                <Sparkles size={28} strokeWidth={2} />
              </div>
              <div className="max-w-sm">
                <p className="text-base font-extrabold text-[#301208]">Build Your First Habit</p>
                <p className="text-xs font-semibold text-[#68614E] mt-1">
                  Start small. Establish daily routines like drinking water, reading, or exercising.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 max-w-md pt-1">
                <span className="text-xs font-bold text-[#938C77] w-full mb-1">Suggestions to get started:</span>
                {[
                  { name: 'Drink 3L Water', icon: 'Droplet', color: 'turquoise', reminderTime: '09:00' },
                  { name: 'Read 10 Pages', icon: 'BookOpen', color: 'purple', reminderTime: '21:00' },
                  { name: 'Exercise 30 mins', icon: 'Dumbbell', color: 'orange', reminderTime: '17:30' },
                  { name: 'Sleep by 11 PM', icon: 'Moon', color: 'blue', reminderTime: '22:45' },
                ].map((sug) => (
                  <button
                    key={sug.name}
                    type="button"
                    onClick={() => addHabit(sug as any)}
                    className="text-xs font-bold bg-white hover:bg-[#76DFCB]/20 text-[#301208] border border-[#DFD8C4] hover:border-[#137B7C] px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
                  >
                    <Plus size={12} className="text-[#137B7C]" />
                    <span>{sug.name}</span>
                  </button>
                ))}
              </div>

              <button
                id="habits-create-first-btn"
                onClick={handleOpenCreate}
                className="mt-2 text-xs font-black bg-[#76DFCB] hover:bg-[#31ADAF] text-[#301208] px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
              >
                + Create Custom Habit
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
                  <WheelTimePickerField
                    idPrefix="habit-reminder-time"
                    label="Reminder Alarm Time"
                    value={reminderTime}
                    onChange={(newVal) => setReminderTime(newVal)}
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
