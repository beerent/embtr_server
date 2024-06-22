import { Response } from './RequestTypes';
import { UserHabitStreakTier } from '../dto/HabitStreak';
import { HabitStreakTier } from '../../schema';

export interface GetUserHabitStreakTierResponse extends Response {
    userHabitStreakTier?: UserHabitStreakTier;
}

export interface GetHabitStreakTiersResponse extends Response {
    habitStreakTiers?: HabitStreakTier[];
}

export interface CreateHabitStreakTier {
    habitStreakTier: HabitStreakTier;
}

export interface CreateHabitStreakTierResponse extends Response {
    habitStreakTier?: HabitStreakTier;
}

export interface UpdateHabitStreakTier {
    habitStreakTier: HabitStreakTier;
}

export interface UpdateHabitStreakTierResponse extends Response {
    habitStreakTier?: HabitStreakTier;
}
