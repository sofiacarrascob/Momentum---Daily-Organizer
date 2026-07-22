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

export function calculateDurationFormatted(startTimeStr: string, endTimeStr?: string): string | null {
  if (!startTimeStr || !endTimeStr) return null;

  const [startH, startM] = startTimeStr.split(':').map(Number);
  const [endH, endM] = endTimeStr.split(':').map(Number);

  const startTotalMins = startH * 60 + startM;
  const endTotalMins = endH * 60 + endM;

  const diffMins = endTotalMins - startTotalMins;
  if (diffMins <= 0) return null;

  if (diffMins < 60) {
    return `${diffMins} min`;
  }

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  if (mins === 0) {
    return `${hours} ${hours === 1 ? 'hr' : 'hrs'}`;
  }

  return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ${mins} min`;
}

export function getTenMinutesBeforeTime(startTimeStr: string): string {
  if (!startTimeStr) return '08:50';
  const [h, m] = startTimeStr.split(':').map(Number);
  let totalMinutes = (isNaN(h) ? 9 : h) * 60 + (isNaN(m) ? 0 : m) - 10;
  if (totalMinutes < 0) totalMinutes += 24 * 60;
  const newH = Math.floor(totalMinutes / 60) % 24;
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

export function formatTaskTimeAndDuration(startTimeStr: string, endTimeStr?: string) {
  const startFormatted = formatTimeFriendly(startTimeStr);
  if (!endTimeStr) {
    return {
      timeDisplay: startFormatted,
      duration: null,
    };
  }

  const endFormatted = formatTimeFriendly(endTimeStr);
  const duration = calculateDurationFormatted(startTimeStr, endTimeStr);

  return {
    timeDisplay: `${startFormatted} – ${endFormatted}`,
    duration,
  };
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
  
  // Find Monday of the current week (0 = Sun, 1 = Mon ... 6 = Sat)
  const dayOfWeek = centerDate.getDay();
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const startOfWeek = new Date(centerDate);
  startOfWeek.setDate(centerDate.getDate() + distanceToMonday);
  
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

export interface TaskTimeItem {
  date: string;
  time: string;
  endTime?: string;
}

/**
 * Priority 1: After the task that ends last on selectedDateStr
 * Priority 2: Next upcoming full hour if no scheduled tasks
 */
export function getIntelligentDefaultTimes(
  selectedDateStr: string,
  tasks: TaskTimeItem[]
): { startTime: string; endTime: string } {
  const dateTasks = tasks.filter((t) => t.date === selectedDateStr);

  if (dateTasks.length > 0) {
    let maxEndMins = -1;
    let maxEndTimeStr = '';

    dateTasks.forEach((t) => {
      let taskEndStr = t.endTime;
      if (!taskEndStr) {
        const [sh, sm] = t.time.split(':').map(Number);
        const eh = (sh + 1) % 24;
        taskEndStr = `${String(eh).padStart(2, '0')}:${String(sm || 0).padStart(2, '0')}`;
      }

      const [eh, em] = taskEndStr.split(':').map(Number);
      const totalMins = (isNaN(eh) ? 0 : eh) * 60 + (isNaN(em) ? 0 : em);

      if (totalMins > maxEndMins) {
        maxEndMins = totalMins;
        maxEndTimeStr = taskEndStr;
      }
    });

    if (maxEndTimeStr) {
      const [sh, sm] = maxEndTimeStr.split(':').map(Number);
      const endH = (sh + 1) % 24;
      const startTime = `${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
      const endTime = `${String(endH).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
      return { startTime, endTime };
    }
  }

  // Priority 2: Next upcoming hour if no tasks scheduled
  const now = new Date();
  const currentH = now.getHours();
  const nextHour = (currentH + 1) % 24;
  const afterNextHour = (nextHour + 1) % 24;

  const startTime = `${String(nextHour).padStart(2, '0')}:00`;
  const endTime = `${String(afterNextHour).padStart(2, '0')}:00`;

  return { startTime, endTime };
}

/**
 * Returns array of YYYY-MM-DD date strings for the remaining days of the week after selectedDateStr (up to Sunday)
 */
export function getRemainingWeekDays(selectedDateStr: string): string[] {
  const weekDays = getWeekDays(selectedDateStr);
  return weekDays
    .map((w) => w.dateStr)
    .filter((dStr) => dStr > selectedDateStr);
}
