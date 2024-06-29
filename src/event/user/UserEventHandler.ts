import { UserBadgeService } from '@src/service/UserBadgeService';
import { Event } from '../events';

export class UserEventHandler {
    public static async onCreated(event: Event.User.Event) {
        UserBadgeService.addNewUserBadge(event.context);
    }

    public static async onPremiumAdded(event: Event.User.Event) {
        UserBadgeService.addPremiumBadge(event.context);
    }

    public static async onPremiumRemoved(event: Event.User.Event) {
        UserBadgeService.removePremiumBadge(event.context);
    }

    public static async onAway(event: Event.User.Event) {
        UserBadgeService.addAwayBadge(event.context);
    }

    public static async onReturned(event: Event.User.Event) {
        UserBadgeService.removeAwayBadge(event.context);
    }
}
