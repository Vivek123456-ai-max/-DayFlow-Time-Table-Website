import { PriorityType } from '../types/database.types';

// XP rewards per priority
export const XP_BY_PRIORITY: Record<PriorityType, number> = {
  Low: 10,
  Medium: 20,
  High: 30,
};

export const PERFECT_DAY_BONUS_XP = 50;

/**
 * Calculates user level based on total XP
 * Formula: Level = floor(sqrt(total_xp / 100)) + 1
 * Level 1: 0 - 99 XP
 * Level 2: 100 - 399 XP
 * Level 3: 400 - 899 XP
 * Level 4: 900 - 1599 XP
 * Level 5: 1600 - 2499 XP, etc.
 */
export function calculateLevel(totalXp: number): number {
  if (totalXp <= 0) return 1;
  return Math.floor(Math.sqrt(totalXp / 100)) + 1;
}

/**
 * XP required to reach a specific level
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.pow(level - 1, 2) * 100;
}

/**
 * XP required to reach next level from current level
 */
export function xpForNextLevel(level: number): number {
  return Math.pow(level, 2) * 100;
}

/**
 * Progress percentage (0 - 100) towards next level
 */
export function getLevelProgress(totalXp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  xpNeeded: number;
} {
  const level = calculateLevel(totalXp);
  const currentFloor = xpForLevel(level);
  const nextCeil = xpForNextLevel(level);
  const diff = nextCeil - currentFloor;
  const currentProgressXp = Math.max(0, totalXp - currentFloor);
  const progressPercent = Math.min(100, Math.round((currentProgressXp / (diff || 1)) * 100));
  const xpNeeded = Math.max(0, nextCeil - totalXp);

  return {
    level,
    currentLevelXp: currentProgressXp,
    nextLevelXp: diff,
    progressPercent,
    xpNeeded,
  };
}
