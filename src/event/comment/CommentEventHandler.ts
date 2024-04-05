import { NotificationService } from '@src/service/NotificationService';
import { Event } from '../events';

export class CommentEventHandler {
    public static async onCreated(event: Event.Comment.Event) {
        NotificationService.createNotification(
            event.context,
            event.toUserId,
            event.fromUserId,
            event.notificationType,
            event.targetId
        );
    }
}
