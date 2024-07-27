import { DetailedHabitStreakService } from '@src/service/DetailedHabitStreakService';
import { PointLedgerRecordService } from '@src/service/PointLedgerRecordService';
import { UserBadgeService } from '@src/service/UserBadgeService';
import { WebSocketService } from '@src/service/WebSocketService';
import { Event } from '../events';

export class PlannedDayEventHandler {
    private static activeOnUpdatedEvents = new Set<string>();
    private static activeOnCompletedEvents = new Set<string>();
    private static activeOnIncompletedEvents = new Set<string>();

    public static async onUpdated(event: Event.PlannedDay.Event) {
        const eventKey = event.getKey();

        if (this.activeOnUpdatedEvents.has(eventKey)) {
            console.log('Already processing', Event.PlannedDay.Updated, event);
            return;
        }

        this.activeOnUpdatedEvents.add(eventKey);
        await Promise.all([
            DetailedHabitStreakService.fullPopulateCurrentStreak(event.context),
            DetailedHabitStreakService.fullPopulateLongestStreak(event.context),
        ]);

        await UserBadgeService.refreshHabitStreakTierBadge(event.context);
        WebSocketService.emitHabitStreakUpdated(event.context);
        this.activeOnUpdatedEvents.delete(eventKey);
    }

    public static async onCompleted(event: Event.PlannedDay.Event) {
        const eventKey = event.getKey();

        if (this.activeOnCompletedEvents.has(eventKey)) {
            console.log('Already processing', Event.PlannedDay.Completed, event);
            return;
        }

        this.activeOnCompletedEvents.add(eventKey);
        await Promise.allSettled([
            WebSocketService.emitPlannedDayComplete(event.context, event.dayKey),
            PointLedgerRecordService.addDayComplete(event.context, event.id),
        ]);
        this.activeOnCompletedEvents.delete(eventKey);
    }

    public static async onIncompleted(event: Event.PlannedDay.Event) {
        const eventKey = event.getKey();

        if (this.activeOnIncompletedEvents.has(eventKey)) {
            console.log('Already processing', Event.PlannedDay.Incompleted, event);
            return;
        }

        this.activeOnIncompletedEvents.add(eventKey);
        await Promise.allSettled([
            WebSocketService.emitPlannedDayIncomplete(event.context, event.dayKey),
            PointLedgerRecordService.subtractDayComplete(event.context, event.id),
        ]);
        this.activeOnIncompletedEvents.delete(eventKey);
    }
}
