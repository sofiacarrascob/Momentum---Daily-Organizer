/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Trophy,
  BarChart3,
  User,
  Check,
  Flame,
  Award
} from 'lucide-react';

import { useAppState } from './hooks/useAppState';
import { Dashboard } from './components/Dashboard';
import { Schedule } from './components/Schedule';
import { Habits } from './components/Habits';
import { Goals } from './components/Goals';
import { Statistics } from './components/Statistics';

const STORAGE_KEY_USER_NAME = 'daily_organizer_user_name';

export default function App() {
  const {
    tasks,
    habits,
    goals,
    streak,
    addTask,
    editTask,
    deleteTask,
    toggleTaskStatus,
    addHabit,
    editHabit,
    deleteHabit,
    toggleHabitCompletion,
    addGoal,
    editGoal,
    deleteGoal,
    updateGoalProgress,
    isLoaded,
  } = useAppState();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [userName, setUserName] = useState<string>('Sofía');
  const [isEditingUser, setIsEditingUser] = useState<boolean>(false);
  const [userInputName, setUserInputName] = useState<string>('Sofía');

  // Load username
  useEffect(() => {
    const savedName = localStorage.getItem(STORAGE_KEY_USER_NAME);
    if (savedName) {
      setUserName(savedName);
      setUserInputName(savedName);
    }
  }, []);

  const handleSaveUserName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInputName.trim()) return;
    setUserName(userInputName.trim());
    localStorage.setItem(STORAGE_KEY_USER_NAME, userInputName.trim());
    setIsEditingUser(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'schedule', label: 'Schedule', icon: CalendarDays },
    { id: 'habits', label: 'Habits', icon: CheckSquare },
    { id: 'goals', label: 'Goals', icon: Trophy },
    { id: 'statistics', label: 'Statistics', icon: BarChart3 },
  ];

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            tasks={tasks}
            habits={habits}
            goals={goals}
            streak={streak}
            toggleTaskStatus={toggleTaskStatus}
            toggleHabitCompletion={toggleHabitCompletion}
            setActiveTab={setActiveTab}
            userName={userName}
          />
        );
      case 'schedule':
        return (
          <Schedule
            tasks={tasks}
            addTask={addTask}
            editTask={editTask}
            deleteTask={deleteTask}
            toggleTaskStatus={toggleTaskStatus}
          />
        );
      case 'habits':
        return (
          <Habits
            habits={habits}
            addHabit={addHabit}
            editHabit={editHabit}
            deleteHabit={deleteHabit}
            toggleHabitCompletion={toggleHabitCompletion}
          />
        );
      case 'goals':
        return (
          <Goals
            goals={goals}
            addGoal={addGoal}
            editGoal={editGoal}
            deleteGoal={deleteGoal}
            updateGoalProgress={updateGoalProgress}
          />
        );
      case 'statistics':
        return (
          <Statistics
            tasks={tasks}
            habits={habits}
            goals={goals}
            streak={streak}
          />
        );
      default:
        return null;
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-turquoise-100 border-t-turquoise-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-neutral-500 font-rounded lowercase">momentum</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" id="app-container">
      
      {/* Top Header / Navigation Bar (Desktop) */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-100 px-6 py-4" id="app-header">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo / Title */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setActiveTab('dashboard')}
            id="header-logo-container"
          >
            <div className="bg-turquoise-500 text-neutral-900 p-1.5 rounded-xl flex items-center justify-center shadow-xs" id="header-logo-badge">
              <CheckSquare size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-semibold text-neutral-800 tracking-tight font-rounded lowercase" id="header-logo-text">
              momentum
            </span>
          </div>

          {/* Nav Items (Desktop Navigation Tabs) */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-50/80 p-1 rounded-2xl border border-neutral-100" id="header-nav-desktop">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  id={`nav-tab-desktop-${item.id}`}
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'text-turquoise-600 font-bold'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  {/* Background pill animation */}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill-desktop"
                      className="absolute inset-0 bg-white border border-neutral-150 shadow-2xs rounded-xl"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon size={16} className={isActive ? 'text-turquoise-500' : 'text-neutral-400'} />
                    <span>{item.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Header Actions (Streak & Profile) */}
          <div className="flex items-center gap-2.5" id="header-actions">
            {/* Streak Indicator Badge */}
            <div
              className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100/70 shadow-2xs font-rounded font-semibold text-sm select-none transition-all hover:bg-amber-100/60"
              id="header-streak-badge"
              title={`${streak} day streak`}
            >
              <Flame size={17} className="fill-amber-500 text-amber-500 animate-pulse" strokeWidth={2.5} />
              <span className="tracking-tight leading-none">{streak}</span>
            </div>

            {/* User Profile / Quick Config Dropdown */}
            <div className="relative" id="header-profile-menu">
              <AnimatePresence mode="wait">
                {isEditingUser ? (
                  <motion.form
                    onSubmit={handleSaveUserName}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-white border border-neutral-200 p-1.5 rounded-xl shadow-lg z-50 min-w-[200px]"
                    id="profile-edit-form"
                  >
                    <input
                      id="profile-name-input"
                      type="text"
                      required
                      value={userInputName}
                      onChange={(e) => setUserInputName(e.target.value)}
                      placeholder="Enter name"
                      className="flex-1 bg-neutral-50 rounded-lg px-2 py-1 text-xs font-semibold text-neutral-800 border border-neutral-100 focus:outline-hidden focus:border-turquoise-500"
                      autoFocus
                    />
                    <button
                      id="profile-save-btn"
                      type="submit"
                      className="bg-turquoise-500 hover:bg-turquoise-600 text-white p-1 rounded-lg cursor-pointer transition-colors"
                    >
                      <Check size={14} />
                    </button>
                  </motion.form>
                ) : (
                  <motion.button
                    id="profile-menu-trigger"
                    onClick={() => setIsEditingUser(true)}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-100 px-3.5 py-2 rounded-2xl cursor-pointer transition-all"
                  >
                    <div className="w-6.5 h-6.5 rounded-full bg-turquoise-100 text-turquoise-600 flex items-center justify-center font-bold text-xs" id="profile-avatar-circle">
                      {userName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-neutral-700 hidden sm:inline" id="profile-user-name">
                      {userName}
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 md:py-10 pb-24 md:pb-12" id="app-main-content">
        <AnimatePresence mode="wait">
          <div key={activeTab} className="h-full">
            {renderActiveView()}
          </div>
        </AnimatePresence>
      </main>

      {/* Sticky Bottom Navigation Bar (Mobile / Tablet Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-neutral-100 px-4 py-2 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.04)]" id="app-mobile-nav">
        <nav className="flex items-center justify-between w-full max-w-md mx-auto gap-1" id="mobile-nav-container">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                id={`nav-tab-mobile-${item.id}`}
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 min-h-[48px] flex items-center justify-center rounded-2xl transition-all cursor-pointer relative ${
                  isActive ? 'text-turquoise-700' : 'text-neutral-400 hover:text-neutral-600'
                }`}
                title={item.label}
                aria-label={item.label}
              >
                {/* Visual active bubble overlay */}
                {isActive && (
                  <motion.div
                    layoutId="active-nav-bg-mobile"
                    className="absolute inset-x-2 inset-y-1 bg-turquoise-50 rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 35 }}
                  />
                )}
                <Icon size={21} className={isActive ? 'text-turquoise-600' : 'text-neutral-400'} />
              </button>
            );
          })}
        </nav>
      </div>

    </div>
  );
}
