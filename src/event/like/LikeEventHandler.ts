import { NotificationService } from '@src/service/NotificationService';
import { Event } from '../events';

export class LikeEventHandler {
    private static activeOnCreatedEvents = new Set<string>();

    public static async onCreated(event: Event.Like.Event) {
        const eventKey = event.getKey();

        if (this.activeOnCreatedEvents.has(eventKey)) {
            console.log('Already processing', Event.Like.Created, event);
            return;
        }

        this.activeOnCreatedEvents.add(eventKey);
        await NotificationService.createNotification(
            event.context,
            event.toUserId,
            event.context.userId,
            event.notificationType,
            event.targetId
        );
        this.activeOnCreatedEvents.delete(eventKey);
    }
}
