import { LevelService } from '@src/service/feature/LevelService';
import { PointLedgerService } from '@src/service/PointLedgerService';
import { Event } from '../events';

export class PointLedgerRecordEventHandler {
    private static activeOnUpdatedEvents = new Set<string>();

    public static async onUpdated(event: Event.PointLedgerRecord.Event) {
        const eventKey = event.getKey();

        if (this.activeOnUpdatedEvents.has(eventKey)) {
            console.log('Already processing', Event.PointLedgerRecord.Updated, event);
            return;
        }

        this.activeOnUpdatedEvents.add(eventKey);

        await PointLedgerService.recalculatePoints(event.context);
        await LevelService.recalculateLevel(event.context);
        await LevelService.emitLevelDetailsUpdated(event.context);

        this.activeOnUpdatedEvents.delete(eventKey);
    }
}
