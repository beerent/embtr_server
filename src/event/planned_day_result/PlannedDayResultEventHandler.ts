import { ApiAlertsService } from '@src/service/ApiAlertsService';
import { PointLedgerRecordService } from '@src/service/PointLedgerRecordService';
import { Event } from '../events';

export class PlannedDayResultEventHandler {
    private static activeOnCreatedEvents = new Set<string>();
    private static activeOnDeletedEvents = new Set<string>();

    public static async onCreated(event: Event.PlannedDayResult.Event) {
        const eventKey = event.getKey();

        if (this.activeOnCreatedEvents.has(eventKey)) {
            console.log('Already processing', Event.PlannedDayResult.Created, event);
            return;
        }

        this.activeOnCreatedEvents.add(eventKey);
        await Promise.allSettled([
            ApiAlertsService.sendAlert('new planned day result was created!'),
            PointLedgerRecordService.addPlannedDayResultCreated(event.context, event.id),
        ]);
        this.activeOnCreatedEvents.delete(eventKey);
    }

    public static async onDeleted(event: Event.PlannedDayResult.Event) {
        const eventKey = event.getKey();

        if (this.activeOnDeletedEvents.has(eventKey)) {
            console.log('Already processing', Event.PlannedDayResult.Created, event);
            return;
        }

        this.activeOnDeletedEvents.add(eventKey);
        await Promise.allSettled([
            PointLedgerRecordService.subtractPlannedDayResultCreated(event.context, event.id),
        ]);
        this.activeOnDeletedEvents.delete(eventKey);
    }
}
