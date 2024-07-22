import { UserBadgeService } from '@src/service/UserBadgeService';
import { Event } from '../events';

export class LevelEventHandler {
    private static activeOnUpdatedEvents = new Set<string>();

    public static async onUpdated(event: Event.Level.Event) {
        const eventKey = event.getKey();

        if (this.activeOnUpdatedEvents.has(eventKey)) {
            console.log('Already processing', Event.Level.Updated, event);
            return;
        }

        this.activeOnUpdatedEvents.add(eventKey);
        await UserBadgeService.refreshLevelBadge(event.context);
        this.activeOnUpdatedEvents.delete(eventKey);
    }
}
