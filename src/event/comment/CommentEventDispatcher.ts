import { UserContext } from '@src/general/auth/Context';
import { NotificationType } from '@src/service/NotificationService';
import eventBus from '../eventBus';
import { Event } from '../events';

export namespace CommentEventDispatcher {
    export const onCreated = (
        context: UserContext,
        notificationType: NotificationType,
        fromUserId: number,
        toUserId: number,
        targetId: number
    ) => {
        const event: Event.Comment.Event = new Event.Comment.Event(
            context,
            notificationType,
            fromUserId,
            toUserId,
            targetId
        );
        eventBus.emit(Event.Comment.Created, event);
    };
}
