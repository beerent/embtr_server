import { UserContext } from '@src/general/auth/Context';
import eventBus from '../eventBus';
import { Event } from '../events';

export namespace UserFeaturePostEventDispatcher {
    export const onAccessed = (context: UserContext, id: number) => {
        const event: Event.UserFeaturedPost.Event = new Event.UserFeaturedPost.Event(context, id);
        eventBus.emit(Event.UserFeaturedPost.Accessed, event);
    };
}
