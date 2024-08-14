import { UserFeaturedPostService } from '@src/service/UserFeaturedPostService';
import { Event } from '../events';

export class UserFeaturedPostEventHandler {
    private static activeOnAccessedEvents = new Set<string>();

    public static async onAccessed(event: Event.UserFeaturedPost.Event) {
        const eventKey = event.getKey();

        if (this.activeOnAccessedEvents.has(eventKey)) {
            console.log('Already processing', Event.UserFeaturedPost.Accessed, event);
            return;
        }

        this.activeOnAccessedEvents.add(eventKey);
        console.log('Marking as viewed', event.id);
        await UserFeaturedPostService.markAsViewed(event.context, event.id);
        this.activeOnAccessedEvents.delete(eventKey);
    }
}
