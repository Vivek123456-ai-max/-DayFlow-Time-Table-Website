import { format, subDays, parseISO, differenceInCalendarDays } from 'date-fns';
import { DailyStats } from '../types/database.types';

export const SUCCESS_THRESHOLD_PERCENT = 75;

/**
 * Formats a Date object to YYYY-MM-DD string
 */
export function formatDateKey(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Calculates current and longest streak from historical daily stats
 */
export function calculateStreaks(dailyStats: DailyStats[], targetDateKey: string = formatDateKey()): {
  currentStreak: number;
  longestStreak: number;
} {
  if (!dailyStats || dailyStats.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Map of date string -> DailyStats
  const statsMap = new Map<string, DailyStats>();
  dailyStats.forEach(s => statsMap.set(s.date, s));

  // Sort dates descending
  const sortedDates = Array.from(statsMap.keys()).sort((a, b) => b.localeCompare(a));
  if (sortedDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = parseISO(targetDateKey);

  const todayStats = statsMap.get(targetDateKey);
  const isTodaySuccessful = todayStats ? todayStats.is_successful : false;

  if (isTodaySuccessful) {
    currentStreak++;
    checkDate = subDays(checkDate, 1);
  } else {
    // If today is not yet successful, check if yesterday was successful to keep streak alive
    const yesterdayKey = formatDateKey(subDays(checkDate, 1));
    const yesterdayStats = statsMap.get(yesterdayKey);
    if (yesterdayStats && yesterdayStats.is_successful) {
      currentStreak++;
      checkDate = subDays(subDays(checkDate, 1), 1);
    } else {
      currentStreak = 0;
      checkDate = subDays(checkDate, 1);
    }
  }

  // Count backwards consecutively
  while (currentStreak > 0) {
    const prevKey = formatDateKey(checkDate);
    const stat = statsMap.get(prevKey);
    if (stat && stat.is_successful) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }

  // Calculate longest streak across all history
  let longestStreak = 0;
  let tempStreak = 0;

  // Sort dates ascending for longest streak calculation
  const ascDates = Array.from(statsMap.keys()).sort((a, b) => a.localeCompare(b));
  let prevDate: Date | null = null;

  for (const dateStr of ascDates) {
    const stat = statsMap.get(dateStr)!;
    const curDate = parseISO(dateStr);

    if (stat.is_successful) {
      if (prevDate === null) {
        tempStreak = 1;
      } else {
        const diff = differenceInCalendarDays(curDate, prevDate);
        if (diff === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      prevDate = curDate;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
      prevDate = null;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
  };
}

/**
 * Returns color level 0-5 for contribution heatmap
 */
export function getContributionLevel(percentage: number, totalTasks: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (totalTasks === 0 || percentage === 0) return 0;
  if (percentage < 25) return 1;
  if (percentage < 50) return 2;
  if (percentage < 75) return 3;
  if (percentage < 100) return 4;
  return 5;
}
