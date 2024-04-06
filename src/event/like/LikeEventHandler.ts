import { NotificationService } from '@src/service/NotificationService';
import { Event } from '../events';

export class LikeEventHandler {
    public static async onCreated(event: Event.Like.Event) {
        await NotificationService.createNotification
            (event.context, event.toUserId, event.context.userId,
                event.notificationType, event.targetId);

    }
}
