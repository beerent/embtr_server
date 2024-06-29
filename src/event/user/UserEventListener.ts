import { logger } from '@src/common/logger/Logger';
import eventBus from '../eventBus';
import { Event } from '../events';

eventBus.on(Event.User.Created, async (event: Event.User.Event) => {
    try {
        logger.info('User event received', Event.User.Created, event);
    } catch (e) {
        console.error('error in CREATED', e);
    }
});

eventBus.on(Event.User.PremiumAdded, async (event: Event.User.Event) => {
    try {
        logger.info('User event received', Event.User.PremiumAdded, event);
    } catch (e) {
        console.error('error in PREMIUM_ADDED', e);
    }
});

eventBus.on(Event.User.PremiumRemoved, async (event: Event.User.Event) => {
    try {
        logger.info('User event received', Event.User.PremiumRemoved, event);
    } catch (e) {
        console.error('error in PREMIUM_REMOVED', e);
    }
});

eventBus.on(Event.User.Away, async (event: Event.User.Event) => {
    try {
        logger.info('User event received', Event.User.Away, event);
    } catch (e) {
        console.error('error in AWAY', e);
    }
});

eventBus.on(Event.User.Returned, async (event: Event.User.Event) => {
    try {
        logger.info('User event received', Event.User.Returned, event);
    } catch (e) {
        console.error('error in RETURNED', e);
    }
});
