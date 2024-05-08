import { PlannedDayService } from '@src/service/PlannedDayService';
import { UserAwardService } from '@src/service/UserAwardService';
import { Event } from '../events';

export class ChallengeEventHandler {
    public static onJoined(event: Event.Challenge.Event) {
        PlannedDayService.updateCompletionStatusByDayKey(event.context, event.context.dayKey);
    }

    public static onLeft(event: Event.Challenge.Event) {
        PlannedDayService.updateCompletionStatusByDayKey(event.context, event.context.dayKey);
    }

    public static onCompleted(event: Event.Challenge.Event) {
        UserAwardService.addAwardFromChallenge(event.context, event.id);
    }

    public static onIncompleted(event: Event.Challenge.Event) {
        UserAwardService.removeAwardFromChallenge(event.context, event.id);
    }
}
