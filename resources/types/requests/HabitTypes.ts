import { Response } from './RequestTypes';
import { HabitJourneys, HabitSummary } from '../habit/Habit';
import { HabitCategory, Task } from '../../schema';
import { HabitStreak, SimpleHabitStreak } from '../dto/HabitStreak';

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

export interface GetSimpleHabitStreakResponse extends Response {
    simpleHabitStreak: SimpleHabitStreak;
}

export interface GetHabitsResponse extends Response {
    habits: Task[];
}

export interface TutorialHabitSelectedRequest {
    id?: number;
    text?: string;
}
