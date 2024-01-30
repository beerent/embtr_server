import { Response } from './RequestTypes';
import { ScheduledHabit } from '../../schema';
import { PureDate } from '../date/PureDate';

export interface CreateScheduledHabitRequest {
    scheduledHabit: ScheduledHabit;
}

export interface CreateScheduledHabitResponse extends Response {
    scheduledHabit?: ScheduledHabit;
}

export interface GetScheduledHabitResponse extends Response {
    scheduledHabit?: ScheduledHabit;
}

export interface GetScheduledHabitsResponse extends Response {
    scheduledHabits?: ScheduledHabit[];
}

export interface UpdateScheduledHabitRequest {
    scheduledHabit: ScheduledHabit;
}

export interface ArchiveScheduledHabitRequest {
    date: PureDate;
}
