import { logger } from '@src/common/logger/Logger';
import eventBus from '../eventBus';
import { Event } from '../events';
import { UserEventHandler } from './UserEventHandler';

eventBus.on(Event.User.Created, async (event: Event.User.Event) => {
    try {
        logger.info('User event received', Event.User.Created, event);
        UserEventHandler.onCreated(event);
    } catch (e) {
        console.error('error in CREATED', e);
    }
});

eventBus.on(Event.User.Setup, async (event: Event.User.Event) => {
    try {
        logger.info('User event received', Event.User.Setup, event);
        UserEventHandler.onSetup(event);
    } catch (e) {
        console.error('error in SETUP', e);
    }
});

eventBus.on(Event.User.Updated, async (event: Event.User.Event) => {
    try {
        logger.info('User event received', Event.User.Updated, event);
        UserEventHandler.onUpdated(event);
    } catch (e) {
        console.error('error in UPDATED', e);
    }
});

eventBus.on(Event.User.PremiumAdded, async (event: Event.User.Event) => {
    try {
        logger.info('User event received', Event.User.PremiumAdded, event);
        UserEventHandler.onPremiumAdded(event);
    } catch (e) {
        console.error('error in PREMIUM_ADDED', e);
    }
});

eventBus.on(Event.User.PremiumRemoved, async (event: Event.User.Event) => {
    try {
        logger.info('User event received', Event.User.PremiumRemoved, event);
        UserEventHandler.onPremiumRemoved(event);
    } catch (e) {
        console.error('error in PREMIUM_REMOVED', e);
    }
});

eventBus.on(Event.User.Away, async (event: Event.User.Event) => {
    try {
        logger.info('User event received', Event.User.Away, event);
        UserEventHandler.onAway(event);
    } catch (e) {
        console.error('error in AWAY', e);
    }
});

eventBus.on(Event.User.Returned, async (event: Event.User.Event) => {
    try {
        logger.info('User event received', Event.User.Returned, event);
        UserEventHandler.onReturned(event);
    } catch (e) {
        console.error('error in RETURNED', e);
    }
});
