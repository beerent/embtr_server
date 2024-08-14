import { UserFeaturedPostService } from '@src/service/UserFeaturedPostService';
import { Event } from '../events';

export class TimelineEventHandler {
    private static activeOnAccessedEvents = new Set<string>();

    public static async onAccessed(event: Event.Timeline.Event) {
        const eventKey = event.getKey();

        if (this.activeOnAccessedEvents.has(eventKey)) {
            console.log('Already processing', Event.Timeline.Accessed, event);
            return;
        }

        this.activeOnAccessedEvents.add(eventKey);
        await UserFeaturedPostService.copyLatest(event.context);
        this.activeOnAccessedEvents.delete(eventKey);
    }
}
