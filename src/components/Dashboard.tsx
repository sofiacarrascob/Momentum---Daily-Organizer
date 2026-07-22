/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Flame, CheckCircle2, Circle, Clock, TrendingUp, Calendar, Heart, Award } from 'lucide-react';
import { Task, Habit, Goal } from '../types';
import { getTodayDateString, formatDateFriendly, formatTaskTimeAndDuration } from '../utils/dateUtils';
import { getColorScheme } from '../utils/colorUtils';
import { getQuoteOfTheDay, getRandomGreeting } from '../utils/quotes';
import { HabitIcon } from './HabitIcon';

interface DashboardProps {
  tasks: Task[];
  habits: Habit[];
  goals: Goal[];
  streak: number;
  toggleTaskStatus: (id: string) => void;
  toggleHabitCompletion: (id: string, dateStr: string) => void;
  setActiveTab: (tab: string) => void;
  userName: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  habits,
  goals,
  streak,
  toggleTaskStatus,
  toggleHabitCompletion,
  setActiveTab,
  userName,
}) => {
  const todayStr = getTodayDateString();
  const friendlyDate = formatDateFriendly(todayStr);
  const greeting = getRandomGreeting(userName);
  const quote = getQuoteOfTheDay(todayStr);

  // Filter today's tasks
  const todayTasks = tasks.filter((t) => t.date === todayStr);
  const completedTodayTasks = todayTasks.filter((t) => t.status === 'Completed');
  
  // Habits for today
  const completedTodayHabits = habits.filter((h) => h.completedDates.includes(todayStr));
  
  // Calculate today's overall progress
  const totalItems = todayTasks.length + habits.length;
  const completedItems = completedTodayTasks.length + completedTodayHabits.length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Top 3 priorities for today (Pending tasks, or completed if not enough pending)
  const pendingTasks = todayTasks.filter((t) => t.status === 'Pending');
  const topPriorities = pendingTasks.slice(0, 3);
  if (topPriorities.length < 3) {
    const remainingCount = 3 - topPriorities.length;
    const completedToFill = completedTodayTasks.slice(0, remainingCount);
    topPriorities.push(...completedToFill);
  }

  return (
    <motion.div
      id="dashboard-page"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-8"
    >
      {/* Header Greeting & Date */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4" id="dashboard-header">
        <div>
          <h1 className="text-3xl font-black text-[#301208] font-heading tracking-tight" id="dashboard-greeting">
            {greeting}
          </h1>
          <div className="flex items-center gap-2 text-[#68614E] mt-1" id="dashboard-date-container">
            <Calendar size={16} className="text-[#31ADAF]" />
            <span className="text-sm font-semibold">{friendlyDate}</span>
          </div>
        </div>

        {/* Dynamic Streak Box */}
        <motion.div
          id="dashboard-streak-badge"
          whileHover={{ scale: 1.03 }}
          className="flex items-center gap-3 bg-[#EF681E]/10 border border-[#EF681E]/20 rounded-2xl px-5 py-3 self-start md:self-auto cursor-pointer shadow-xs"
          onClick={() => setActiveTab('habits')}
        >
          <div className="bg-[#EF681E] text-white p-2 rounded-xl" id="dashboard-streak-icon-container">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-[#EF681E] font-bold uppercase tracking-wider">Daily Streak</div>
            <div className="text-xl font-black text-[#301208] leading-none mt-0.5">
              {streak} {streak === 1 ? 'Day' : 'Days'}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Hero Quote Card */}
      <div
        className="bg-[#F3EFE0]/70 border border-[#DFD8C4]/80 rounded-3xl p-6 relative overflow-hidden shadow-2xs"
        id="dashboard-quote-card"
      >
        <div className="absolute top-0 right-0 p-8 text-[#C2BBA7]/30 pointer-events-none">
          <Heart size={80} strokeWidth={1} />
        </div>
        <div className="relative z-10 max-w-xl">
          <span className="text-[11px] font-black text-[#137B7C] uppercase tracking-widest bg-[#76DFCB]/30 px-3 py-1 rounded-full">
            Today's Focus
          </span>
          <p className="text-base text-[#301208] italic mt-3 font-semibold">
            "{quote.text}"
          </p>
          <p className="text-xs text-[#68614E] mt-1 font-bold">— {quote.author}</p>
        </div>
      </div>

      {/* Grid: Overview and Priorities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-bento-grid">
        
        {/* Left Bento: Daily Overview & Progress (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white border border-[#DFD8C4]/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-6" id="dashboard-overview-card">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-[#301208] font-heading tracking-tight">Today's Progress</h2>
              <span className="text-xs font-bold text-[#68614E] bg-[#F3EFE0] px-2.5 py-1 rounded-lg">
                {completedItems}/{totalItems} Done
              </span>
            </div>

            {/* Circular / Ring Progress styled beautifully */}
            <div className="flex items-center justify-center py-6" id="dashboard-progress-radial">
              <div className="relative flex items-center justify-center">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#F3EFE0"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#76DFCB"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={376.8}
                    initial={{ strokeDashoffset: 376.8 }}
                    animate={{ strokeDashoffset: 376.8 - (376.8 * progressPercent) / 100 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-[#301208] font-heading">{progressPercent}%</span>
                  <span className="text-[10px] text-[#68614E] font-bold tracking-wider uppercase">Complete</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#DFD8C4]/50 pt-4 grid grid-cols-2 gap-4 text-center">
            <div className="cursor-pointer hover:bg-[#FAF7E8] p-2.5 rounded-2xl transition-colors" onClick={() => setActiveTab('schedule')}>
              <div className="text-2xl font-black text-[#137B7C] font-heading">{completedTodayTasks.length}/{todayTasks.length}</div>
              <div className="text-xs text-[#68614E] font-bold">Tasks Completed</div>
            </div>
            <div className="cursor-pointer hover:bg-[#FAF7E8] p-2.5 rounded-2xl transition-colors" onClick={() => setActiveTab('habits')}>
              <div className="text-2xl font-black text-[#EF681E] font-heading">{completedTodayHabits.length}/{habits.length}</div>
              <div className="text-xs text-[#68614E] font-bold">Habits Done</div>
            </div>
          </div>
        </div>

        {/* Right Bento: Top 3 Priorities (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white border border-[#DFD8C4]/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between" id="dashboard-priorities-card">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-[#301208] font-heading tracking-tight">Top Priorities</h2>
              <button
                onClick={() => setActiveTab('schedule')}
                className="text-xs font-bold text-[#137B7C] hover:text-[#31ADAF] flex items-center gap-1 transition-colors cursor-pointer"
              >
                View Timeline →
              </button>
            </div>

            {topPriorities.length > 0 ? (
              <div className="space-y-3" id="dashboard-priority-list">
                {topPriorities.map((task) => {
                  const isCompleted = task.status === 'Completed';
                  const scheme = getColorScheme(task.color);

                  return (
                    <motion.div
                      id={`priority-item-${task.id}`}
                      key={task.id}
                      whileHover={{ x: 3 }}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        isCompleted
                          ? 'bg-[#FAF7E8]/60 border-[#DFD8C4]/50 opacity-65'
                          : 'bg-white border-[#DFD8C4]/70 hover:border-[#31ADAF]/50 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <button
                          id={`priority-toggle-${task.id}`}
                          onClick={() => toggleTaskStatus(task.id)}
                          className="flex-shrink-0 cursor-pointer transition-colors p-0.5 rounded-full text-[#301208]"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5.5 h-5.5 text-[#137B7C] fill-[#76DFCB]/30" />
                          ) : (
                            <Circle className="w-5.5 h-5.5 text-[#C2BBA7] hover:text-[#76DFCB]" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-bold truncate ${
                              isCompleted ? 'text-[#938C77] line-through font-normal' : 'text-[#301208]'
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-[#68614E] font-medium mt-0.5">
                            <Clock size={12} />
                            <span>{formatTaskTimeAndDuration(task.time, task.endTime).timeDisplay}</span>
                          </div>
                        </div>
                      </div>

                      {/* Accent color bar */}
                      <div className={`w-1.5 h-8 rounded-full ${scheme.solidBg}`} />
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-[#938C77] flex flex-col items-center justify-center gap-3" id="dashboard-empty-priorities">
                <div className="bg-[#FAF7E8] p-3 rounded-full text-[#68614E]">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#301208]">All caught up!</p>
                  <p className="text-xs text-[#68614E] mt-0.5">No tasks planned for today yet.</p>
                </div>
                <button
                  id="dashboard-create-task-btn"
                  onClick={() => setActiveTab('schedule')}
                  className="mt-2 text-xs font-bold bg-[#76DFCB] hover:bg-[#31ADAF] text-[#301208] px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Create Today's Plan
                </button>
              </div>
            )}
          </div>

          {/* Quick habit review bar */}
          <div className="border-t border-[#DFD8C4]/60 pt-5 mt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-[#68614E] uppercase tracking-wider">Quick Habits Checklist</span>
              <button
                onClick={() => setActiveTab('habits')}
                className="text-[11px] font-bold text-[#137B7C] hover:text-[#31ADAF] transition-colors cursor-pointer"
              >
                Manage Habits →
              </button>
            </div>
            {habits.length > 0 ? (
              <div className="flex flex-wrap gap-2" id="dashboard-quick-habits">
                {habits.slice(0, 4).map((h) => {
                  const done = h.completedDates.includes(todayStr);
                  return (
                    <motion.button
                      id={`quick-habit-${h.id}`}
                      key={h.id}
                      onClick={() => toggleHabitCompletion(h.id, todayStr)}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        done
                          ? 'bg-[#76DFCB] border-[#31ADAF] text-[#301208] shadow-xs'
                          : 'bg-white hover:bg-[#FAF7E8] border-[#DFD8C4]/70 text-[#301208]'
                      }`}
                    >
                      <HabitIcon name={h.icon} size={14} className={done ? 'text-[#301208]' : 'text-[#68614E]'} />
                      <span>{h.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#938C77] font-medium italic">
                No habits created yet. Click "Manage Habits" to set up your daily routines!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Goal teaser */}
      <div className="bg-white border border-[#DFD8C4]/80 rounded-3xl p-6 shadow-xs" id="dashboard-goals-teaser">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-[#301208] font-heading tracking-tight flex items-center gap-2">
            <Award className="text-[#EF681E] w-5 h-5" />
            <span>Goal Milestones</span>
          </h2>
          <button
            onClick={() => setActiveTab('goals')}
            className="text-xs font-bold text-[#137B7C] hover:text-[#31ADAF] flex items-center gap-1 transition-colors cursor-pointer"
          >
            View All Goals →
          </button>
        </div>
        
        {goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="dashboard-goals-grid">
            {goals.slice(0, 3).map((g) => {
              return (
                <div key={g.id} className="p-4 rounded-2xl border border-[#DFD8C4]/70 hover:border-[#31ADAF]/50 bg-[#FAF7E8]/40 transition-colors" id={`dashboard-goal-${g.id}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[#301208] truncate pr-2">{g.name}</span>
                    <span className="text-xs font-black text-[#EF681E] font-heading">{g.progress}%</span>
                  </div>
                  {/* Progress track */}
                  <div className="w-full bg-[#F3EFE0] h-2.5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#76DFCB]"
                      initial={{ width: 0 }}
                      animate={{ width: `${g.progress}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#938C77] font-medium italic">
            No long-term goals set yet. Click "View All Goals" to add your first milestone!
          </p>
        )}
      </div>
    </motion.div>
  );
};
