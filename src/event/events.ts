import { Context } from '@src/general/auth/Context';

export namespace Event {
    export namespace PlannedDay {
        export const Updated = 'PLANNED_DAY_UPDATED';

        export interface Event {
            context: Context;
            userId: number;
            id: number;
        }
    }

    export namespace PlannedHabit {
        export const Updated = 'PLANNED_HABIT_UPDATED';
        export const Created = 'PLANNED_HABIT_CREATED';

        export interface Event {
            context: Context;
            id: number;
        }
    }

    export namespace UserProperty {
        export const Missing = 'USER_PROPERTY_MISSING';

        export interface Event {
            context: Context;
            key: string;
        }
    }

    export namespace HabitStreak {
        export const Refresh = 'HABIT_STREAK_REFRESH';

        export interface Event {
            context: Context;
            userId: number;
        }
    }
}
