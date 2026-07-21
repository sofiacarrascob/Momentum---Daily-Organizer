/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Task {
  id: string;
  title: string;
  time: string; // "HH:MM"
  color: string; // color name identifier
  status: 'Pending' | 'Completed';
  date: string; // "YYYY-MM-DD"
  reminderTime?: string; // "HH:MM"
}

export interface Habit {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // color name identifier
  completedDates: string[]; // array of "YYYY-MM-DD"
  reminderTime?: string; // "HH:MM"
}

export interface Goal {
  id: string;
  name: string;
  description?: string;
  progress: number; // 0 to 100
  color: string; // color name identifier
}

export interface AppState {
  tasks: Task[];
  habits: Habit[];
  goals: Goal[];
  streak: number;
}
