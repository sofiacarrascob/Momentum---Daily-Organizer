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
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { MomentumLogo } from './components/MomentumLogo';

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
  const [userName, setUserName] = useState<string>('User');
  const [isEditingUser, setIsEditingUser] = useState<boolean>(false);
  const [userInputName, setUserInputName] = useState<string>('User');

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
      <div className="min-h-screen bg-[#FEFBEC] flex flex-col items-center justify-center gap-3">
        <MomentumLogo size={48} className="animate-pulse" />
        <p className="text-sm font-bold text-[#137B7C] font-brand lowercase tracking-tight">momentum</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFBEC] text-[#301208] flex flex-col" id="app-container">
      
      {/* Top Header / Navigation Bar (Desktop) */}
      <header className="sticky top-0 z-40 bg-[#FEFBEC]/90 backdrop-blur-md border-b border-[#DFD8C4]/60 px-6 py-3.5" id="app-header">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo / Title */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none group"
            onClick={() => setActiveTab('dashboard')}
            id="header-logo-container"
          >
            <div className="group-hover:scale-105 transition-transform flex items-center justify-center" id="header-logo-badge">
              <MomentumLogo size={32} />
            </div>
            <span className="text-2xl font-black text-[#137B7C] tracking-tight font-brand lowercase leading-none mt-0.5" id="header-logo-text">
              momentum
            </span>
          </div>

          {/* Nav Items (Desktop Navigation Tabs) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F3EFE0]/70 p-1.5 rounded-2xl border border-[#DFD8C4]/50" id="header-nav-desktop">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  id={`nav-tab-desktop-${item.id}`}
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'text-[#301208] font-bold'
                      : 'text-[#504938] hover:text-[#301208]'
                  }`}
                >
                  {/* Background pill animation */}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill-desktop"
                      className="absolute inset-0 bg-[#76DFCB] shadow-xs rounded-xl"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon size={16} className={isActive ? 'text-[#301208]' : 'text-[#68614E]'} />
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
              className="flex items-center gap-1.5 bg-[#EF681E]/10 text-[#EF681E] px-3 py-1.5 rounded-full border border-[#EF681E]/20 shadow-2xs font-heading font-bold text-xs select-none transition-all hover:bg-[#EF681E]/15 cursor-pointer"
              id="header-streak-badge"
              title={`${streak} day streak`}
              onClick={() => setActiveTab('habits')}
            >
              <Flame size={16} className="fill-[#EF681E] text-[#EF681E] animate-pulse" strokeWidth={2.5} />
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
                    className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-white border border-[#DFD8C4] p-1.5 rounded-xl shadow-lg z-50 min-w-[200px]"
                    id="profile-edit-form"
                  >
                    <input
                      id="profile-name-input"
                      type="text"
                      required
                      value={userInputName}
                      onChange={(e) => setUserInputName(e.target.value)}
                      placeholder="Enter name"
                      className="flex-1 bg-[#FEFBEC] rounded-lg px-2 py-1 text-xs font-semibold text-[#301208] border border-[#DFD8C4] focus:outline-hidden focus:border-[#31ADAF]"
                      autoFocus
                    />
                    <button
                      id="profile-save-btn"
                      type="submit"
                      className="bg-[#76DFCB] hover:bg-[#31ADAF] text-[#301208] p-1 rounded-lg cursor-pointer transition-colors"
                    >
                      <Check size={14} />
                    </button>
                  </motion.form>
                ) : (
                  <motion.button
                    id="profile-menu-trigger"
                    onClick={() => setIsEditingUser(true)}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-2 bg-[#F3EFE0] hover:bg-[#E9E4D3] border border-[#DFD8C4]/60 px-3.5 py-1.5 rounded-2xl cursor-pointer transition-all"
                  >
                    <div className="w-6.5 h-6.5 rounded-full bg-[#137B7C] text-[#FEFBEC] flex items-center justify-center font-bold text-xs" id="profile-avatar-circle">
                      {userName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-[#301208] hidden sm:inline" id="profile-user-name">
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
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 sm:px-6 md:py-8 pb-32 md:pb-12" id="app-main-content">
        <AnimatePresence mode="wait">
          <div key={activeTab} className="h-full">
            {renderActiveView()}
          </div>
        </AnimatePresence>
      </main>

      {/* Sticky Bottom Navigation Bar (Mobile / Tablet Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FEFBEC]/95 backdrop-blur-xl border-t border-[#DFD8C4]/80 px-3 py-2.5 pb-safe shadow-[0_-6px_20px_rgba(48,18,8,0.06)]" id="app-mobile-nav">
        <nav className="flex items-center justify-between w-full max-w-md mx-auto gap-1 min-h-[58px]" id="mobile-nav-container">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                id={`nav-tab-mobile-${item.id}`}
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 min-h-[52px] py-1.5 px-1 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all cursor-pointer relative ${
                  isActive ? 'text-[#301208] font-bold' : 'text-[#68614E] hover:text-[#301208]'
                }`}
                title={item.label}
                aria-label={item.label}
              >
                {/* Visual active bubble overlay */}
                {isActive && (
                  <motion.div
                    layoutId="active-nav-bg-mobile"
                    className="absolute inset-x-1 inset-y-0.5 bg-[#76DFCB] rounded-2xl shadow-xs -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon size={19} className={isActive ? 'text-[#301208] stroke-[2.5]' : 'text-[#68614E]'} />
                <span className={`text-[10px] font-heading leading-none ${isActive ? 'font-extrabold text-[#301208]' : 'font-semibold text-[#68614E]'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* PWA Custom Installation Banner */}
      <PWAInstallPrompt />

    </div>
  );
}
