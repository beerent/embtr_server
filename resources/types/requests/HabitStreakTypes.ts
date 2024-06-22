import { Response } from './RequestTypes';
import { UserHabitStreakTier } from '../dto/HabitStreak';
import { HabitStreakTier } from '../../schema';

export interface GetUserHabitStreakTierResponse extends Response {
    userHabitStreakTier?: UserHabitStreakTier;
}

export interface GetHabitStreakTiersResponse extends Response {
    habitStreakTiers: HabitStreakTier[]
}
