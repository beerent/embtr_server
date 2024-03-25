import { Context } from '@src/general/auth/Context';
import eventBus from '../eventBus';
import { Event } from '../events';

export namespace HabitStreakEventDispatcher {
    export const onRefresh = (context: Context, userId: number) => {
        const type: Event.HabitStreak.Event = {
            context,
            userId: userId,
        };

        eventBus.emit(Event.HabitStreak.Refresh, type);
    };
}
