import eventBus from '../eventBus';
import { Event } from '../events';
import { HabitStreakEventHandler } from './HabitStreakEventHandler';

eventBus.on(Event.HabitStreak.Refresh, (event: Event.HabitStreak.Event) => {
    try {
        HabitStreakEventHandler.onRefresh(event);
    } catch (e) {
        console.error('error in', Event.HabitStreak.Refresh, e);
    }
});
