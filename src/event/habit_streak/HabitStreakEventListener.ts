import { logger } from '@src/common/logger/Logger';
import eventBus from '../eventBus';
import { Event } from '../events';
import { HabitStreakEventHandler } from './HabitStreakEventHandler';

eventBus.on(Event.HabitStreak.Refresh, (event: Event.HabitStreak.Event) => {
    try {
        logger.info('HabitStreak event received', Event.HabitStreak.Refresh, event);
        HabitStreakEventHandler.onRefresh(event);
    } catch (e) {
        console.error('error in', Event.HabitStreak.Refresh, e);
    }
});
