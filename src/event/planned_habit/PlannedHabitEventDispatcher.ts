import { Context } from '@src/general/auth/Context';
import eventBus from '../eventBus';
import { Event } from '../events';

export namespace PlannedHabitEventDispatcher {
    export const onUpdated = (context: Context, id: number, habitId: number) => {
        const event: Event.PlannedHabit.Event = new Event.PlannedHabit.Event(context, id, habitId);
        eventBus.emit(Event.PlannedHabit.Updated, event);
    };

    export const onCreated = (context: Context, id: number, habitId: number) => {
        const event: Event.PlannedHabit.Event = new Event.PlannedHabit.Event(context, id, habitId);
        eventBus.emit(Event.PlannedHabit.Created, event);
    };

    export const onCompleted = (context: Context, id: number, habitId: number) => {
        const event: Event.PlannedHabit.Event = new Event.PlannedHabit.Event(context, id, habitId);
        eventBus.emit(Event.PlannedHabit.Completed, event);
    };

    export const onIncompleted = (context: Context, id: number, habitId: number) => {
        const event: Event.PlannedHabit.Event = new Event.PlannedHabit.Event(context, id, habitId);
        eventBus.emit(Event.PlannedHabit.Incompleted, event);
    };
}
