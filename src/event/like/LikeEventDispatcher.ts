import { Context } from '@src/general/auth/Context';
import { NotificationType } from '@src/service/NotificationService';
import eventBus from '../eventBus';
import { Event } from '../events';

export namespace LikeEventDispatcher {
    export const onCreated = (
        context: Context,
        notificationType: NotificationType,
        fromUserId: number,
        toUserId: number,
        targetId: number
    ) => {
        const event: Event.Like.Event = new Event.Like.Event(
            context,
            notificationType,
            fromUserId,
            toUserId,
            targetId
        );
        eventBus.emit(Event.Like.Created, event);
    };
}
