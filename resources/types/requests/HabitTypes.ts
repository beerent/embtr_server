import { Response } from './RequestTypes';
import { HabitJourneys, HabitSummary } from '../habit/Habit';
import { HabitCategory } from '../../schema';
import { HabitStreak } from '../dto/HabitStreak';

export interface GetHabitJourneyResponse extends Response {
    habitJourneys?: HabitJourneys;
}

export interface GetHabitCategoriesResponse extends Response {
    habitCategories?: HabitCategory[];
}

export interface GetHabitCategoryResponse extends Response {
    habitCategory?: HabitCategory;
}

export interface GetHabitSummariesResponse extends Response {
    habitSummaries?: HabitSummary[];
}

export interface GetHabitSummaryResponse extends Response {
    habitSummary?: HabitSummary;
}

export interface GetHabitStreakResponse extends Response {
    habitStreak: HabitStreak;
}
