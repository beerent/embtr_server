import { Context } from '@src/general/auth/Context';
import eventBus from '../eventBus';
import { Event } from '../events';

export namespace PlannedHabitEventDispatcher {
    export const onUpdated = (context: Context, id: number, habitId: number) => {
        const type: Event.PlannedHabit.Event = {
            context,
            habitId,
            id,
        };

        eventBus.emit(Event.PlannedHabit.Updated, type);
    };

    export const onCreated = (context: Context, id: number, habitId: number) => {
        const type: Event.PlannedHabit.Event = {
            context,
            habitId,
            id,
        };

        eventBus.emit(Event.PlannedHabit.Created, type);
    };

    export const onCompleted = (context: Context, id: number, habitId: number) => {
        const type: Event.PlannedHabit.Event = {
            context,
            habitId,
            id,
        };

        eventBus.emit(Event.PlannedHabit.Completed, type);
    };

    export const onIncompleted = (context: Context, id: number, habitId: number) => {
        const type: Event.PlannedHabit.Event = {
            context,
            habitId,
            id,
        };

        eventBus.emit(Event.PlannedHabit.Incompleted, type);
    };
}
