import { UserContext } from '@src/general/auth/Context';
import eventBus from '../eventBus';
import { Event } from '../events';

export namespace PlannedHabitEventDispatcher {
    export const onUpdated = (
        context: UserContext,
        id: number,
        habitId: number,
        dayKey: string
    ) => {
        const event: Event.PlannedHabit.Event = new Event.PlannedHabit.Event(
            context,
            id,
            habitId,
            dayKey
        );
        eventBus.emit(Event.PlannedHabit.Updated, event);
    };

    export const onCreated = (
        context: UserContext,
        id: number,
        habitId: number,
        dayKey: string
    ) => {
        const event: Event.PlannedHabit.Event = new Event.PlannedHabit.Event(
            context,
            id,
            habitId,
            dayKey
        );
        eventBus.emit(Event.PlannedHabit.Created, event);
    };

    export const onCompleted = (
        context: UserContext,
        id: number,
        habitId: number,
        dayKey: string,
        totalTimesOfDay: number
    ) => {
        const event: Event.PlannedHabit.Event = new Event.PlannedHabit.Event(
            context,
            id,
            habitId,
            dayKey,
            totalTimesOfDay
        );
        eventBus.emit(Event.PlannedHabit.Completed, event);
    };

    export const onIncompleted = (
        context: UserContext,
        id: number,
        habitId: number,
        dayKey: string
    ) => {
        const event: Event.PlannedHabit.Event = new Event.PlannedHabit.Event(
            context,
            id,
            habitId,
            dayKey
        );
        eventBus.emit(Event.PlannedHabit.Incompleted, event);
    };
}
