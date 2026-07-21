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
      className="space-y-8"
    >
      {/* Title Header */}
      <div id="statistics-title-section">
        <h1 className="text-2xl font-bold text-neutral-800 tracking-tight" id="statistics-title">
          Progress Insights
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5" id="statistics-subtitle">
          Observe your dedication, streaks, and long-term milestones.
        </p>
      </div>

      {/* Grid of Key Today Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="statistics-today-grid">
        
        {/* Metric 1: Today's Completion Rate */}
        <div className="bg-white border border-neutral-100 rounded-3xl p-5 shadow-sm shadow-neutral-100 flex flex-col justify-between h-40" id="stat-card-rate">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Today's Rate</span>
            <div className="bg-turquoise-50 text-turquoise-600 p-2 rounded-xl" id="stat-icon-rate">
              <BarChart3 size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-neutral-800 leading-none">{completionRateToday}%</div>
            <p className="text-xs text-neutral-500 mt-1 font-medium">Of planned actions checked off</p>
          </div>
          {/* Visual mini bar */}
          <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-turquoise-500 h-full rounded-full" style={{ width: `${completionRateToday}%` }} />
          </div>
        </div>

        {/* Metric 2: Streak status */}
        <div className="bg-white border border-neutral-100 rounded-3xl p-5 shadow-sm shadow-neutral-100 flex flex-col justify-between h-40" id="stat-card-streak">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Active Streak</span>
            <div className="bg-orange-50 text-orange-600 p-2 rounded-xl" id="stat-icon-streak">
              <Flame size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-orange-600 leading-none">{streak} Days</div>
            <p className="text-xs text-neutral-500 mt-1 font-medium">Keep completing daily habits</p>
          </div>
          {/* Encouraging message */}
          <div className="text-4xs font-bold text-orange-500 uppercase tracking-widest leading-none">
            {streak >= 3 ? '🔥 Performing Beautifully!' : '💪 Build consistency daily'}
          </div>
        </div>

        {/* Metric 3: Today's Schedule Tasks */}
        <div className="bg-white border border-neutral-100 rounded-3xl p-5 shadow-sm shadow-neutral-100 flex flex-col justify-between h-40" id="stat-card-tasks">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Schedule Tasks</span>
            <div className="bg-purple-50 text-purple-600 p-2 rounded-xl" id="stat-icon-tasks">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-neutral-800 leading-none">
              {completedTodayTasks.length}/{todayTasks.length}
            </div>
            <p className="text-xs text-neutral-500 mt-1 font-medium">Completed for today</p>
          </div>
          <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full"
              style={{ width: `${todayTasks.length > 0 ? (completedTodayTasks.length / todayTasks.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Habits completed */}
        <div className="bg-white border border-neutral-100 rounded-3xl p-5 shadow-sm shadow-neutral-100 flex flex-col justify-between h-40" id="stat-card-habits">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Habit Routines</span>
            <div className="bg-blue-50 text-blue-600 p-2 rounded-xl" id="stat-icon-habits">
              <ListChecks size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-neutral-800 leading-none">
              {completedTodayHabits.length}/{habits.length}
            </div>
            <p className="text-xs text-neutral-500 mt-1 font-medium">Habits checked off today</p>
          </div>
          <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full"
              style={{ width: `${habits.length > 0 ? (completedTodayHabits.length / habits.length) * 100 : 0}%` }}
            />
          </div>
        </div>

      </div>

      {/* Grid: All-time Accomplishments & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="statistics-accomplishments-panel">
        
        {/* All-time Achievements Box */}
        <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm shadow-neutral-100 flex flex-col justify-between" id="stat-box-achievements">
          <div>
            <h2 className="text-lg font-bold text-neutral-800 tracking-tight flex items-center gap-2 mb-5">
              <Award className="text-orange-500 w-5 h-5" />
              <span>Consistency Accomplishments</span>
            </h2>

            <div className="space-y-4" id="stat-lifetime-metrics">
              {/* Metric Row 1: Lifetime Tasks */}
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100/40">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-7 rounded-full bg-turquoise-500" />
                  <div>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Lifetime Tasks Completed</p>
                    <p className="text-sm font-semibold text-neutral-700">Dedication to scheduled plans</p>
                  </div>
                </div>
                <span className="text-2xl font-extrabold text-turquoise-600 pr-1">{lifetimeTasksCompleted}</span>
              </div>

              {/* Metric Row 2: Habit Completions */}
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100/40">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-7 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Habit Check-Ins</p>
                    <p className="text-sm font-semibold text-neutral-700">Small daily loops establishing flow</p>
                  </div>
                </div>
                <span className="text-2xl font-extrabold text-blue-600 pr-1">{lifetimeHabitCompletions}</span>
              </div>

              {/* Metric Row 3: Goals Completed */}
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100/40">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-7 rounded-full bg-orange-500" />
                  <div>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Long-term Horizons Met</p>
                    <p className="text-sm font-semibold text-neutral-700">Milestone goals fully finished</p>
                  </div>
                </div>
                <span className="text-2xl font-extrabold text-orange-600 pr-1">
                  {completedGoalsCount} <span className="text-xs font-semibold text-neutral-400">of {goals.length}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational / Reflective Tip Box */}
        <div className="bg-neutral-50/50 border border-neutral-100 rounded-3xl p-6 flex flex-col justify-between" id="stat-box-reflective">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Smile className="text-turquoise-500 w-5 h-5" />
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Aesthetic Mindset</span>
            </div>
            
            <h3 className="text-base font-bold text-neutral-800 leading-snug">
              "Continuous improvement is better than delayed perfection."
            </h3>
            
            <p className="text-xs text-neutral-500 leading-relaxed font-medium">
              momentum is designed around systems rather than pure willpower. Each small checkbox completed in your <strong>Daily Timeline</strong> or checked habit in the <strong>Weekly Grid</strong> compounds over days, weeks, and months.
            </p>

            <p className="text-xs text-neutral-500 leading-relaxed font-medium">
              Don't worry about maintaining 100% completion perfectly. What matters is the willingness to return to your dashboard, review your top priorities, and perform at least one small positive action every single day.
            </p>
          </div>

          <div className="border-t border-neutral-200/50 pt-4 flex items-center gap-2 text-2xs text-neutral-400 font-semibold uppercase tracking-wider">
            <Calendar size={12} className="text-turquoise-500" />
            <span>Structured consistency engine active</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
