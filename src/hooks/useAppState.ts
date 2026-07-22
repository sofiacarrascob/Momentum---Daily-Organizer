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
      endTime: '08:30',
      color: 'turquoise',
      status: 'Completed',
      date: today,
      reminderTime: '07:20'
    },
    {
      id: 'task-t2',
      title: 'Refactor Core Components',
      time: '10:00',
      endTime: '11:30',
      color: 'skyblue',
      status: 'Completed',
      date: today,
      reminderTime: '09:50'
    },
    {
      id: 'task-t3',
      title: 'Sync with Team Designer',
      time: '14:00',
      endTime: '15:00',
      color: 'lavender',
      status: 'Pending',
      date: today,
      reminderTime: '13:50'
    },
    {
      id: 'task-t4',
      title: 'Evening Jog & Outdoor Stretch',
      time: '18:30',
      endTime: '19:15',
      color: 'green',
      status: 'Pending',
      date: today,
      reminderTime: '18:20'
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

export function calculateStreak(tasks: Task[], habits: Habit[], todayStr: string): number {
  const formatDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateActive = (dateStr: string) => {
    const hasCompletedTask = tasks.some((t) => t.date === dateStr && t.status === 'Completed');
    const hasCompletedHabit = habits.some((h) => h.completedDates.includes(dateStr));
    return hasCompletedTask || hasCompletedHabit;
  };

  const [year, month, day] = todayStr.split('-').map(Number);
  const checkDate = new Date(year, month - 1, day);

  const todayActive = isDateActive(todayStr);

  let currentStreak = 0;

  if (todayActive) {
    currentStreak = 1;
    const prevDate = new Date(checkDate);
    while (true) {
      prevDate.setDate(prevDate.getDate() - 1);
      const prevDateStr = formatDateStr(prevDate);
      if (isDateActive(prevDateStr)) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else {
    const yesterdayDate = new Date(checkDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = formatDateStr(yesterdayDate);

    if (isDateActive(yesterdayStr)) {
      currentStreak = 1;
      const prevDate = new Date(yesterdayDate);
      while (true) {
        prevDate.setDate(prevDate.getDate() - 1);
        const prevDateStr = formatDateStr(prevDate);
        if (isDateActive(prevDateStr)) {
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
      setTasks([]);
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify([]));
    }

    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    } else {
      setHabits([]);
      localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify([]));
    }

    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else {
      setGoals([]);
      localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify([]));
    }

    setIsLoaded(true);
  }, []);

  // Compute and update streak whenever tasks or habits change
  useEffect(() => {
    if (!isLoaded) return;
    const todayStr = getTodayDateString();
    const computedStreak = calculateStreak(tasks, habits, todayStr);
    setStreak(computedStreak);
  }, [tasks, habits, isLoaded]);

  // Sync state helpers to update React state & localStorage
  const updateTasksState = (updater: Task[] | ((prev: Task[]) => Task[])) => {
    setTasks((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save tasks to localStorage:', err);
      }
      return next;
    });
  };

  const updateHabitsState = (updater: Habit[] | ((prev: Habit[]) => Habit[])) => {
    setHabits((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save habits to localStorage:', err);
      }
      return next;
    });
  };

  const updateGoalsState = (updater: Goal[] | ((prev: Goal[]) => Goal[])) => {
    setGoals((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save goals to localStorage:', err);
      }
      return next;
    });
  };

  // TASK CRUD
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };
    updateTasksState((prev) => [...prev, newTask]);
    return newTask;
  };

  const addMultipleTasks = (tasksToAdd: Omit<Task, 'id'>[]) => {
    updateTasksState((prev) => {
      const newTasks: Task[] = tasksToAdd.map((t, index) => ({
        ...t,
        id: `task-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`,
      }));
      return [...prev, ...newTasks];
    });
  };

  const editTask = (id: string, updatedFields: Partial<Omit<Task, 'id'>>) => {
    updateTasksState((prev) => prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t)));
  };

  const deleteTask = (id: string) => {
    updateTasksState((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTaskStatus = (id: string) => {
    updateTasksState((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            status: (t.status === 'Pending' ? 'Completed' : 'Pending') as 'Pending' | 'Completed',
          };
        }
        return t;
      })
    );
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
