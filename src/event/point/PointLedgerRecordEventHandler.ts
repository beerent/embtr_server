import { PointLedgerService } from '@src/service/PointLedgerService';
import { Event } from '../events';

export class PointLedgerRecordEventHandler {
    private static activeOnUpdatedEvents = new Set<string>();

    public static async onUpdated(event: Event.PointLedgerRecord.Event) {
        const eventKey = event.getKey();

        if (this.activeOnUpdatedEvents.has(eventKey)) {
            console.log('Already processing', Event.PointLedgerRecord.UPDATED, event);
            return;
        }

        this.activeOnUpdatedEvents.add(eventKey);
        await Promise.all([PointLedgerService.recalculatePoints(event.context)]);
        this.activeOnUpdatedEvents.delete(eventKey);
    }
}
