import { PlannedDayService } from '@src/service/PlannedDayService';
import { UserAwardService } from '@src/service/UserAwardService';
import { Event } from '../events';

export class ChallengeEventHandler {
    private static activeOnJoinedEvents = new Set<string>();
    private static activeOnLeftEvents = new Set<string>();
    private static activeOnCompletedEvents = new Set<string>();
    private static activeOnIncompletedEvents = new Set<string>();

    public static async onJoined(event: Event.Challenge.Event) {
        const key = event.getKey();

        if (this.activeOnJoinedEvents.has(key)) {
            console.log('Already processing', Event.Challenge.Joined, event);
            return;
        }

        this.activeOnJoinedEvents.add(key);
        await PlannedDayService.updateCompletionStatusByDayKey(event.context, event.context.dayKey);
        this.activeOnJoinedEvents.delete(key);
    }

    public static async onLeft(event: Event.Challenge.Event) {
        const key = event.getKey();

        if (this.activeOnLeftEvents.has(key)) {
            console.log('Already processing', Event.Challenge.Left, event);
            return;
        }

        this.activeOnLeftEvents.add(key);
        await PlannedDayService.updateCompletionStatusByDayKey(event.context, event.context.dayKey);
        this.activeOnLeftEvents.delete(key);
    }

    public static async onCompleted(event: Event.Challenge.Event) {
        const key = event.getKey();

        if (this.activeOnCompletedEvents.has(key)) {
            console.log('Already processing', Event.Challenge.Completed, event);
            return;
        }

        this.activeOnCompletedEvents.add(key);
        await UserAwardService.addAwardFromChallenge(event.context, event.id);
        this.activeOnCompletedEvents.delete(key);
    }

    public static async onIncompleted(event: Event.Challenge.Event) {
        const key = event.getKey();

        if (this.activeOnIncompletedEvents.has(key)) {
            console.log('Already processing', Event.Challenge.Incompleted, event);
            return;
        }

        this.activeOnIncompletedEvents.add(key);
        await UserAwardService.removeAwardFromChallenge(event.context, event.id);
        this.activeOnIncompletedEvents.delete(key);
    }
}
