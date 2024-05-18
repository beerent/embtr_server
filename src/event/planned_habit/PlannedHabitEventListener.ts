import { logger } from '@src/common/logger/Logger';
import eventBus from '../eventBus';
import { Event } from '../events';
import { PlannedHabitEventHandler } from './PlannedHabitEventHandler';

eventBus.on(Event.PlannedHabit.Created, async (event: Event.PlannedHabit.Event) => {
    try {
        logger.info('PlannedHabit event received', Event.PlannedHabit.Created, event);
        await PlannedHabitEventHandler.onCreated(event);
    } catch (e) {
        console.error('error in PLANNED_HABIT_CREATED', e);
    }
});

eventBus.on(Event.PlannedHabit.Updated, async (event: Event.PlannedHabit.Event) => {
    try {
        logger.info('PlannedHabit event received', Event.PlannedHabit.Updated, event);
        await PlannedHabitEventHandler.onUpdated(event);
    } catch (e) {
        console.error('error in PLANNED_HABIT_UPDATED', e);
    }
});
