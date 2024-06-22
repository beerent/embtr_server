import { Response } from './RequestTypes';
import { UserHabitStreakTier } from '../dto/HabitStreak';
import { HabitStreakTier } from '../../schema';

export interface GetUserHabitStreakTierResponse extends Response {
    userHabitStreakTier?: UserHabitStreakTier;
}

export interface GetHabitStreakTiersResponse extends Response {
    habitStreakTiers: HabitStreakTier[]
}

export interface UpdateHabitStreakTier {
    iconId?: number
    badgeId?: number
    minStreak: number
    maxStreak: number
    backgroundColor: string
}

export interface UpdateHabitStreakTierResponse extends Response {
    habitStreakTier: HabitStreakTier
}
