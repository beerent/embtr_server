import { Context } from '@src/general/auth/Context';

export namespace Event {
    export interface Event {
        context: Context;
        id: number;
    }

    export interface ResourceEvent {
        context: Context;
        key: string;
    }

    export enum Type {
        CREATED,
        UPDATED,
        MISSING,
    }

    export namespace PlannedDay {
        export const Updated = 'PLANNED_DAY_UPDATED';
    }

    export namespace PlannedHabit {
        export const Updated = 'PLANNED_HABIT_UPDATED';
        export const Created = 'PLANNED_HABIT_CREATED';
    }

    export namespace UserProperty {
        export const Missing = 'USER_PROPERTY_MISSING';
    }
}
