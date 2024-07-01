import { NotificationService } from '@src/service/NotificationService';
import { Event } from '../events';

export class CommentEventHandler {
    private static activeOnCreatedEvents = new Set<string>();

    public static async onCreated(event: Event.Comment.Event) {
        const key = event.getKey();

        if (this.activeOnCreatedEvents.has(key)) {
            console.log('Already processing', Event.Comment.Created, event);
            return;
        }

        this.activeOnCreatedEvents.add(key);
        NotificationService.createNotification(
            event.context,
            event.toUserId,
            event.fromUserId,
            event.notificationType,
            event.targetId
        );
        this.activeOnCreatedEvents.delete(key);
    }
}
