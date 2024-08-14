import { logger } from '@src/common/logger/Logger';
import eventBus from '../eventBus';
import { Event } from '../events';
import { UserFeaturedPostEventHandler } from './UserFeaturedPostEventHandler';

eventBus.on(Event.UserFeaturedPost.Accessed, async (event: Event.UserFeaturedPost.Event) => {
    try {
        logger.info('UserFeaturePost event received', Event.UserFeaturedPost.Accessed, event);
        UserFeaturedPostEventHandler.onAccessed(event);
    } catch (e) {
        console.error('error in' + Event.UserFeaturedPost.Accessed, e);
    }
});
