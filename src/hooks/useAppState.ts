/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Task, Habit, Goal } from '../types';
import { getTodayDateString, getYesterdayDateString, getOffsetDateString } from '../utils/dateUtils';

const STORAGE_KEY_TASKS = 'daily_organizer_tasks';
const STORAGE_KEY_HABITS = 'daily_organizer_habits';
const STORAGE_KEY_GOALS = 'daily_organizer_goals';

// Initial Mock Data to make the app look stunning immediately
const MOCK_TASKS = (): Task[] => {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  return [
    // Completed yesterday
    {
      id: 'task-y1',
      title: 'Morning Yoga Session',
      time: '07:00',
      color: 'turquoise',
      status: 'Completed',
      date: yesterday,
      reminderTime: '06:55'
    },
    {
      id: 'task-y2',
      title: 'Draft Project Specs',
      time: '11:00',
      color: 'purple',
      status: 'Completed',
      date: yesterday
    },
    // Tasks for today
    {
      id: 'task-t1',
      title: 'Morning Meditation & Planning',
      time: '07:30',
      color: 'turquoise',
      status: 'Completed',
      date: today,
      reminderTime: '07:25'
    },
    {
      id: 'task-t2',
      title: 'Refactor Core Components',
      time: '10:00',
      color: 'turquoise',
      status: 'Completed',
      date: today,
      reminderTime: '09:55'
    },
    {
      id: 'task-t3',
      title: 'Sync with Team Designer',
      time: '14:00',
      color: 'purple',
      status: 'Pending',
      date: today,
      reminderTime: '13:55'
    },
    {
      id: 'task-t4',
      title: 'Evening Jog & Outdoor Stretch',
      time: '18:30',
      color: 'orange',
      status: 'Pending',
      date: today
    }
  ];
};

const MOCK_HABITS = (): Habit[] => {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  const d2DaysAgo = getOffsetDateString(-2);
  const d3DaysAgo = getOffsetDateString(-3);
  
  return [
    {
      id: 'habit-1',
      name: 'Drink 3L Water',
      icon: 'Droplet',
      color: 'turquoise',
      completedDates: [d3DaysAgo, d2DaysAgo, yesterday, today],
      reminderTime: '09:00'
    },
    {
      id: 'habit-2',
      name: 'Read 10 Pages',
      icon: 'BookOpen',
      color: 'purple',
      completedDates: [d3DaysAgo, d2DaysAgo, yesterday],
      reminderTime: '21:00'
    },
    {
      id: 'habit-3',
      name: 'Exercise 30 mins',
      icon: 'Dumbbell',
      color: 'orange',
      completedDates: [d3DaysAgo, d2DaysAgo, yesterday],
      reminderTime: '17:30'
    },
    {
      id: 'habit-4',
      name: 'Sleep by 11 PM',
      icon: 'Moon',
      color: 'blue',
      completedDates: [d3DaysAgo, d2DaysAgo, yesterday],
      reminderTime: '22:45'
    }
  ];
};

const MOCK_GOALS = (): Goal[] => [
  {
    id: 'goal-1',
    name: 'Learn Conversational Chinese',
    description: 'Complete HSK 2 level vocabulary and practice daily on Duolingo.',
    progress: 45,
    color: 'turquoise'
  },
  {
    id: 'goal-2',
    name: 'Build Portfolio Website',
    description: 'Design and code a beautiful personal portfolio using React, Tailwind CSS and Motion.',
    progress: 75,
    color: 'purple'
  },
  {
    id: 'goal-3',
    name: 'Maintain Fitness Habit',
    description: 'Go to the gym or run 4 times a week, tracking energy and strength levels.',
    progress: 60,
    color: 'orange'
  }
];

export function calculateStreak(habits: Habit[], todayStr: string): number {
  if (habits.length === 0) return 0;

  // Let's create a helper function to format dates correctly
  const formatDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateFullyCompleted = (dateStr: string) => {
    return habits.every((h) => h.completedDates.includes(dateStr));
  };

  // Safe parsing using local midnight representation to avoid timezone shifts
  const [year, month, day] = todayStr.split('-').map(Number);
  const checkDate = new Date(year, month - 1, day);

  const todayCompleted = isDateFullyCompleted(todayStr);

  let currentStreak = 0;

  if (todayCompleted) {
    currentStreak = 1;
    // Walk backward starting from yesterday
    const prevDate = new Date(checkDate);
    while (true) {
      prevDate.setDate(prevDate.getDate() - 1);
      const prevDateStr = formatDateStr(prevDate);
      if (isDateFullyCompleted(prevDateStr)) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else {
    // Check if yesterday is fully completed
    const yesterdayDate = new Date(checkDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = formatDateStr(yesterdayDate);

    if (isDateFullyCompleted(yesterdayStr)) {
      currentStreak = 1;
      // Walk backward starting from day before yesterday
      const prevDate = new Date(yesterdayDate);
      while (true) {
        prevDate.setDate(prevDate.getDate() - 1);
        const prevDateStr = formatDateStr(prevDate);
        if (isDateFullyCompleted(prevDateStr)) {
          currentStreak++;
        } else {
          break;
        }
      }
    } else {
      currentStreak = 0;
    }
  }

  return currentStreak;
}

export function useAppState() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
    const savedHabits = localStorage.getItem(STORAGE_KEY_HABITS);
    const savedGoals = localStorage.getItem(STORAGE_KEY_GOALS);

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      const mockTasks = MOCK_TASKS();
      setTasks(mockTasks);
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(mockTasks));
    }

    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    } else {
      const mockHabits = MOCK_HABITS();
      setHabits(mockHabits);
      localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(mockHabits));
    }

    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else {
      const mockGoals = MOCK_GOALS();
      setGoals(mockGoals);
      localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(mockGoals));
    }

    setIsLoaded(true);
  }, []);

  // Compute and update streak whenever habits change
  useEffect(() => {
    if (!isLoaded) return;
    const todayStr = getTodayDateString();
    const computedStreak = calculateStreak(habits, todayStr);
    setStreak(computedStreak);
  }, [habits, isLoaded]);

  // Sync state helpers to update React state & localStorage
  const updateTasksState = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(newTasks));
  };

  const updateHabitsState = (newHabits: Habit[]) => {
    setHabits(newHabits);
    localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(newHabits));
  };

  const updateGoalsState = (newGoals: Goal[]) => {
    setGoals(newGoals);
    localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(newGoals));
  };

  // TASK CRUD
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };
    updateTasksState([...tasks, newTask]);
    return newTask;
  };

  const editTask = (id: string, updatedFields: Partial<Omit<Task, 'id'>>) => {
    const newTasks = tasks.map((t) => (t.id === id ? { ...t, ...updatedFields } : t));
    updateTasksState(newTasks);
  };

  const deleteTask = (id: string) => {
    updateTasksState(tasks.filter((t) => t.id !== id));
  };

  const toggleTaskStatus = (id: string) => {
    const newTasks = tasks.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          status: (t.status === 'Pending' ? 'Completed' : 'Pending') as 'Pending' | 'Completed',
        };
      }
      return t;
    });
    updateTasksState(newTasks);
  };

  // HABIT CRUD
  const addHabit = (habit: Omit<Habit, 'id' | 'completedDates'>) => {
    const newHabit: Habit = {
      ...habit,
      id: `habit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      completedDates: [],
    };
    updateHabitsState([...habits, newHabit]);
    return newHabit;
  };

  const editHabit = (id: string, updatedFields: Partial<Omit<Habit, 'id' | 'completedDates'>>) => {
    const newHabits = habits.map((h) => (h.id === id ? { ...h, ...updatedFields } : h));
    updateHabitsState(newHabits);
  };

  const deleteHabit = (id: string) => {
    updateHabitsState(habits.filter((h) => h.id !== id));
  };

  const toggleHabitCompletion = (id: string, dateStr: string) => {
    const newHabits = habits.map((h) => {
      if (h.id === id) {
        const isCompleted = h.completedDates.includes(dateStr);
        const newCompletedDates = isCompleted
          ? h.completedDates.filter((d) => d !== dateStr)
          : [...h.completedDates, dateStr];
        return {
          ...h,
          completedDates: newCompletedDates,
        };
      }
      return h;
    });
    updateHabitsState(newHabits);
  };

  // GOAL CRUD
  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };
    updateGoalsState([...goals, newGoal]);
    return newGoal;
  };

  const editGoal = (id: string, updatedFields: Partial<Omit<Goal, 'id'>>) => {
    const newGoals = goals.map((g) => (g.id === id ? { ...g, ...updatedFields } : g));
    updateGoalsState(newGoals);
  };

  const deleteGoal = (id: string) => {
    updateGoalsState(goals.filter((g) => g.id !== id));
  };

  const updateGoalProgress = (id: string, progress: number) => {
    const boundedProgress = Math.max(0, Math.min(100, progress));
    const newGoals = goals.map((g) => (g.id === id ? { ...g, progress: boundedProgress } : g));
    updateGoalsState(newGoals);
  };

  return {
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
  };
}
