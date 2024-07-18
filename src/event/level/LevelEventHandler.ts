import { WebSocketService } from '@src/service/WebSocketService';
import { Event } from '../events';

export class LevelEventHandler {
    private static activeOnUpdatedEvents = new Set<string>();

    public static async onUpdated(event: Event.Level.Event) {
        const eventKey = event.getKey();

        if (this.activeOnUpdatedEvents.has(eventKey)) {
            console.log('Already processing', Event.Level.Updated, event.getKey());
            return;
        }

        this.activeOnUpdatedEvents.add(eventKey);
        WebSocketService.emitLevelDetailsUpdated(event.context, event.levelDetails);
        this.activeOnUpdatedEvents.delete(eventKey);
    }
}
