import { logger } from '@src/common/logger/Logger';
import eventBus from '../eventBus';
import { Event } from '../events';
import { UserPropertyEventHandler } from './UserPropertyEventHandler';

eventBus.on(Event.UserProperty.Missing, async (event: Event.UserProperty.Event) => {
    try {
        logger.info('UserProperty event received', Event.UserProperty.Missing, event);
        await UserPropertyEventHandler.onMissing(event);
    } catch (e) {
        console.error('Error updating planned day completion status', e);
    }
});

eventBus.on(Event.UserProperty.Updated, async (event: Event.UserProperty.Event) => {
    try {
        logger.info('UserProperty event received', Event.UserProperty.Updated, event);
    } catch (e) {
        console.error('Error updating planned day completion status', e);
    }
});
