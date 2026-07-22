/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Flame, Award, BarChart3, ListChecks, Calendar, Smile } from 'lucide-react';
import { Task, Habit, Goal } from '../types';
import { getTodayDateString } from '../utils/dateUtils';

interface StatisticsProps {
  tasks: Task[];
  habits: Habit[];
  goals: Goal[];
  streak: number;
}

export const Statistics: React.FC<StatisticsProps> = ({
  tasks,
  habits,
  goals,
  streak,
}) => {
  const todayStr = getTodayDateString();

  // Today's counts
  const todayTasks = tasks.filter((t) => t.date === todayStr);
  const completedTodayTasks = todayTasks.filter((t) => t.status === 'Completed');
  
  const completedTodayHabits = habits.filter((h) => h.completedDates.includes(todayStr));

  // Today's Completion Rate
  const totalItemsToday = todayTasks.length + habits.length;
  const completedItemsToday = completedTodayTasks.length + completedTodayHabits.length;
  const completionRateToday = totalItemsToday > 0 ? Math.round((completedItemsToday / totalItemsToday) * 100) : 0;

  // Lifetime counts
  const lifetimeTasksCompleted = tasks.filter((t) => t.status === 'Completed').length;
  const lifetimeHabitCompletions = habits.reduce((acc, h) => acc + h.completedDates.length, 0);
  const completedGoalsCount = goals.filter((g) => g.progress >= 100).length;

  return (
    <motion.div
      id="statistics-page"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Title Header */}
      <div id="statistics-title-section">
        <h1 className="text-xl sm:text-2xl font-black text-[#301208] tracking-tight font-heading" id="statistics-title">
          Progress Insights
        </h1>
        <p className="text-xs font-semibold text-[#68614E] mt-0.5" id="statistics-subtitle">
          Observe your dedication, streaks, and long-term milestones.
        </p>
      </div>

      {/* Grid of Key Today Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="statistics-today-grid">
        
        {/* Metric 1: Today's Completion Rate */}
        <div className="bg-white border border-[#DFD8C4]/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between h-36" id="stat-card-rate">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#68614E] uppercase tracking-wider">Today's Rate</span>
            <div className="bg-[#76DFCB]/20 text-[#137B7C] p-1.5 rounded-xl" id="stat-icon-rate">
              <BarChart3 size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#301208] leading-none">{completionRateToday}%</div>
            <p className="text-[11px] text-[#68614E] mt-0.5 font-medium">Of planned actions checked off</p>
          </div>
          {/* Visual mini bar */}
          <div className="w-full bg-[#FAF7E8] h-1.5 rounded-full overflow-hidden border border-[#DFD8C4]/40">
            <div className="bg-[#76DFCB] h-full rounded-full" style={{ width: `${completionRateToday}%` }} />
          </div>
        </div>

        {/* Metric 2: Streak status */}
        <div className="bg-white border border-[#DFD8C4]/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between h-36" id="stat-card-streak">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#68614E] uppercase tracking-wider">Active Streak</span>
            <div className="bg-[#EF681E]/15 text-[#EF681E] p-1.5 rounded-xl" id="stat-icon-streak">
              <Flame size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#EF681E] leading-none">{streak} Days</div>
            <p className="text-[11px] text-[#68614E] mt-0.5 font-medium">Daily habits completed</p>
          </div>
          {/* Encouraging message */}
          <div className="text-[9px] font-extrabold text-[#EF681E] uppercase tracking-wider leading-none">
            {streak >= 3 ? '🔥 Performing Beautifully!' : '💪 Build consistency daily'}
          </div>
        </div>

        {/* Metric 3: Today's Schedule Tasks */}
        <div className="bg-white border border-[#DFD8C4]/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between h-36" id="stat-card-tasks">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#68614E] uppercase tracking-wider">Schedule Tasks</span>
            <div className="bg-[#AE99F5]/20 text-[#6A4BC9] p-1.5 rounded-xl" id="stat-icon-tasks">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#301208] leading-none">
              {completedTodayTasks.length}/{todayTasks.length}
            </div>
            <p className="text-[11px] text-[#68614E] mt-0.5 font-medium">Completed for today</p>
          </div>
          <div className="w-full bg-[#FAF7E8] h-1.5 rounded-full overflow-hidden border border-[#DFD8C4]/40">
            <div
              className="bg-[#AE99F5] h-full rounded-full"
              style={{ width: `${todayTasks.length > 0 ? (completedTodayTasks.length / todayTasks.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Habits completed */}
        <div className="bg-white border border-[#DFD8C4]/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between h-36" id="stat-card-habits">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#68614E] uppercase tracking-wider">Habit Routines</span>
            <div className="bg-[#7EC6F1]/20 text-[#2884C7] p-1.5 rounded-xl" id="stat-icon-habits">
              <ListChecks size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#301208] leading-none">
              {completedTodayHabits.length}/{habits.length}
            </div>
            <p className="text-[11px] text-[#68614E] mt-0.5 font-medium">Habits checked off today</p>
          </div>
          <div className="w-full bg-[#FAF7E8] h-1.5 rounded-full overflow-hidden border border-[#DFD8C4]/40">
            <div
              className="bg-[#7EC6F1] h-full rounded-full"
              style={{ width: `${habits.length > 0 ? (completedTodayHabits.length / habits.length) * 100 : 0}%` }}
            />
          </div>
        </div>

      </div>

      {/* Grid: All-time Accomplishments & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="statistics-accomplishments-panel">
        
        {/* All-time Achievements Box */}
        <div className="bg-white border border-[#DFD8C4]/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between" id="stat-box-achievements">
          <div>
            <h2 className="text-base font-black text-[#301208] font-heading tracking-tight flex items-center gap-2 mb-4">
              <Award className="text-[#EF681E] w-4.5 h-4.5" />
              <span>Consistency Accomplishments</span>
            </h2>

            <div className="space-y-3" id="stat-lifetime-metrics">
              {/* Metric Row 1: Lifetime Tasks */}
              <div className="flex items-center justify-between p-3.5 bg-[#FAF7E8]/70 rounded-xl border border-[#DFD8C4]/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-6 rounded-full bg-[#76DFCB]" />
                  <div>
                    <p className="text-[10px] font-bold text-[#68614E] uppercase tracking-wider">Lifetime Tasks Completed</p>
                    <p className="text-xs font-bold text-[#301208]">Dedication to scheduled plans</p>
                  </div>
                </div>
                <span className="text-xl font-black text-[#137B7C] pr-1">{lifetimeTasksCompleted}</span>
              </div>

              {/* Metric Row 2: Habit Completions */}
              <div className="flex items-center justify-between p-3.5 bg-[#FAF7E8]/70 rounded-xl border border-[#DFD8C4]/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-6 rounded-full bg-[#7EC6F1]" />
                  <div>
                    <p className="text-[10px] font-bold text-[#68614E] uppercase tracking-wider">Total Habit Check-Ins</p>
                    <p className="text-xs font-bold text-[#301208]">Small daily loops establishing flow</p>
                  </div>
                </div>
                <span className="text-xl font-black text-[#2884C7] pr-1">{lifetimeHabitCompletions}</span>
              </div>

              {/* Metric Row 3: Goals Completed */}
              <div className="flex items-center justify-between p-3.5 bg-[#FAF7E8]/70 rounded-xl border border-[#DFD8C4]/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-6 rounded-full bg-[#EF681E]" />
                  <div>
                    <p className="text-[10px] font-bold text-[#68614E] uppercase tracking-wider">Long-term Horizons Met</p>
                    <p className="text-xs font-bold text-[#301208]">Milestone goals fully finished</p>
                  </div>
                </div>
                <span className="text-xl font-black text-[#EF681E] pr-1">
                  {completedGoalsCount} <span className="text-[10px] font-bold text-[#68614E]">of {goals.length}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational / Reflective Tip Box */}
        <div className="bg-[#FAF7E8]/60 border border-[#DFD8C4]/80 rounded-2xl p-5 flex flex-col justify-between" id="stat-box-reflective">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Smile className="text-[#137B7C] w-4.5 h-4.5" />
              <span className="text-[10px] font-bold text-[#68614E] uppercase tracking-widest">Aesthetic Mindset</span>
            </div>
            
            <h3 className="text-sm font-bold text-[#301208] leading-snug font-heading">
              "Continuous improvement is better than delayed perfection."
            </h3>
            
            <p className="text-[11px] text-[#68614E] leading-relaxed font-medium">
              momentum is designed around systems rather than pure willpower. Each small checkbox completed in your <strong>Daily Timeline</strong> or checked habit in the <strong>Weekly Grid</strong> compounds over days, weeks, and months.
            </p>

            <p className="text-[11px] text-[#68614E] leading-relaxed font-medium">
              Don't worry about maintaining 100% completion perfectly. What matters is the willingness to return to your dashboard, review your top priorities, and perform at least one small positive action every single day.
            </p>
          </div>

          <div className="border-t border-[#DFD8C4]/60 pt-3 mt-3 flex items-center gap-2 text-[10px] text-[#68614E] font-bold uppercase tracking-wider">
            <Calendar size={12} className="text-[#137B7C]" />
            <span>Structured consistency engine active</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
