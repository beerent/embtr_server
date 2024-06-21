import { PureDate } from '../date/PureDate';
import { Constants } from '../constants/constants';
import { HabitStreakTier } from '../../schema';

export interface HabitStreakResult {
    result: Constants.CompletionState;
    dayKey: string;
}

export interface HabitStreak {
    startDate: PureDate;
    medianDate: PureDate;
    endDate: PureDate;

    currentStreak: number;
    longestStreak: number;
    streakRank: number;
    results: HabitStreakResult[];
}

export interface SimpleHabitStreak {
    currentStreak: number;
    longestStreak: number;
}

export interface UserHabitStreakTier {
    simpleHabitStreak: SimpleHabitStreak;
    habitStreakTier: HabitStreakTier;
}
