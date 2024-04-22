import { PlannedDayService } from '@src/service/PlannedDayService';
import { Event } from '../events';

export class ChallengeEventHandler {
    public static onJoined(event: Event.Challenge.Event) {
        PlannedDayService.updateCompletionStatusByDayKey(event.context, event.context.dayKey);
    }

    public static onLeft(event: Event.Challenge.Event) {
        PlannedDayService.updateCompletionStatusByDayKey(event.context, event.context.dayKey);
    }
}
