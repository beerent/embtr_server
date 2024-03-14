import { PureDate } from '../date/PureDate';
import { Constants } from '../constants/constants';

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
