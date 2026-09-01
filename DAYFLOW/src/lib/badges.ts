import { Badge, DailyStats, UserStats } from '../types/database.types';

export interface BadgeDefinition {
  code: string;
  name: string;
  description: string;
  icon: string;
  category: 'milestone' | 'streak' | 'perfect' | 'habit' | 'category';
  requirementType: string;
  requirementValue: number;
  xpBonus: number;
}

export const MASTER_BADGES: BadgeDefinition[] = [
  {
    code: 'first_step',
    name: 'First Step',
    description: 'Complete your very first task on DayFlow',
    icon: 'Sparkles',
    category: 'milestone',
    requirementType: 'total_tasks',
    requirementValue: 1,
    xpBonus: 50,
  },
  {
    code: 'streak_3',
    name: 'Consistency Starter',
    description: 'Maintain a 3-day productivity streak',
    icon: 'Flame',
    category: 'streak',
    requirementType: 'streak',
    requirementValue: 3,
    xpBonus: 75,
  },
  {
    code: 'streak_7',
    name: '7 Day Warrior',
    description: 'Maintain a 7-day productivity streak',
    icon: 'Zap',
    category: 'streak',
    requirementType: 'streak',
    requirementValue: 7,
    xpBonus: 150,
  },
  {
    code: 'streak_30',
    name: '30 Day Beast',
    description: 'Maintain an unbroken 30-day streak',
    icon: 'Crown',
    category: 'streak',
    requirementType: 'streak',
    requirementValue: 30,
    xpBonus: 500,
  },
  {
    code: 'streak_100',
    name: 'Century Legend',
    description: 'Reach a legendary 100-day streak',
    icon: 'Trophy',
    category: 'streak',
    requirementType: 'streak',
    requirementValue: 100,
    xpBonus: 2000,
  },
  {
    code: 'perfect_week',
    name: 'Perfect Week',
    description: 'Complete 100% of tasks for 7 consecutive days',
    icon: 'Star',
    category: 'perfect',
    requirementType: 'perfect_days',
    requirementValue: 7,
    xpBonus: 300,
  },
  {
    code: 'early_bird',
    name: 'Early Bird',
    description: 'Complete 10 morning tasks before 9:00 AM',
    icon: 'Sun',
    category: 'habit',
    requirementType: 'early_tasks',
    requirementValue: 10,
    xpBonus: 100,
  },
  {
    code: 'coding_master',
    name: 'Coding Master',
    description: 'Complete 50 coding tasks',
    icon: 'Code',
    category: 'category',
    requirementType: 'category_coding',
    requirementValue: 50,
    xpBonus: 250,
  },
  {
    code: 'study_grind',
    name: 'Knowledge Seeker',
    description: 'Complete 50 study tasks',
    icon: 'BookOpen',
    category: 'category',
    requirementType: 'category_study',
    requirementValue: 50,
    xpBonus: 250,
  },
  {
    code: 'century_tasks',
    name: 'Task Master',
    description: 'Complete 100 total tasks on DayFlow',
    icon: 'CheckCheck',
    category: 'milestone',
    requirementType: 'total_tasks',
    requirementValue: 100,
    xpBonus: 400,
  },
];

/**
 * Checks which badges are unlocked based on user stats and daily stats
 */
export function evaluateBadgesToUnlock(
  unlockedCodes: Set<string>,
  userStats: UserStats,
  dailyStats: DailyStats[],
  categoryCompletedCounts: Record<string, number> = {}
): BadgeDefinition[] {
  const newUnlocks: BadgeDefinition[] = [];

  // Count consecutive perfect days
  let consecutivePerfect = 0;
  let maxConsecutivePerfect = 0;
  const sortedStats = [...dailyStats].sort((a, b) => a.date.localeCompare(b.date));
  for (const stat of sortedStats) {
    if (stat.is_perfect) {
      consecutivePerfect++;
      if (consecutivePerfect > maxConsecutivePerfect) maxConsecutivePerfect = consecutivePerfect;
    } else {
      consecutivePerfect = 0;
    }
  }

  for (const badge of MASTER_BADGES) {
    if (unlockedCodes.has(badge.code)) continue;

    let isUnlocked = false;

    switch (badge.requirementType) {
      case 'total_tasks':
        isUnlocked = userStats.total_completed_tasks >= badge.requirementValue;
        break;
      case 'streak':
        isUnlocked = (userStats.current_streak >= badge.requirementValue) || 
                     (userStats.longest_streak >= badge.requirementValue);
        break;
      case 'perfect_days':
        isUnlocked = maxConsecutivePerfect >= badge.requirementValue;
        break;
      case 'category_coding':
        isUnlocked = (categoryCompletedCounts['Coding'] || 0) >= badge.requirementValue;
        break;
      case 'category_study':
        isUnlocked = (categoryCompletedCounts['Study'] || 0) >= badge.requirementValue;
        break;
    }

    if (isUnlocked) {
      newUnlocks.push(badge);
    }
  }

  return newUnlocks;
}
