/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getOffsetDateString(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateFriendly(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTimeFriendly(timeStr: string): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = String(minutes).padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

// Get dates for a week centered on or starting near today
export interface DayTab {
  dateStr: string;
  dayName: string;
  dayNum: number;
  isToday: boolean;
}

export function getWeekDays(centerDateStr: string = getTodayDateString()): DayTab[] {
  const [year, month, day] = centerDateStr.split('-').map(Number);
  const centerDate = new Date(year, month - 1, day);
  
  // Find Sunday of the current week
  const dayOfWeek = centerDate.getDay();
  const startOfWeek = new Date(centerDate);
  startOfWeek.setDate(centerDate.getDate() - dayOfWeek);
  
  const weekDays: DayTab[] = [];
  const todayStr = getTodayDateString();
  
  for (let i = 0; i < 7; i++) {
    const current = new Date(startOfWeek);
    current.setDate(startOfWeek.getDate() + i);
    
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const dStr = String(current.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${dStr}`;
    
    weekDays.push({
      dateStr,
      dayName: current.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: current.getDate(),
      isToday: dateStr === todayStr,
    });
  }
  
  return weekDays;
}
