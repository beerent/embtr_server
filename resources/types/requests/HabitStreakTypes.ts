import { Response } from './RequestTypes';
import { UserHabitStreakTier } from '../dto/HabitStreak';

export interface GetUserHabitStreakTierResponse extends Response {
  userHabitStreakTier?: UserHabitStreakTier;
}
