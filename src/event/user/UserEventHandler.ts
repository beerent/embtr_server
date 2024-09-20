import { UserBadgeService } from '@src/service/UserBadgeService';
import { UserPostService } from '@src/service/UserPostService';
import { WebSocketService } from '@src/service/WebSocketService';
import { Event } from '../events';

export class UserEventHandler {
    private static activeOnCreatedEvents = new Set<string>();
    private static activeOnUpdatedEvents = new Set<string>();
    private static activeOnPremiumAddedEvents = new Set<string>();
    private static activeOnPremiumRemovedEvents = new Set<string>();
    private static activeOnAwayEvents = new Set<string>();
    private static activeOnReturnedEvents = new Set<string>();

    public static async onCreated(event: Event.User.Event) {
        const eventKey = event.getKey();

        if (this.activeOnCreatedEvents.has(eventKey)) {
            console.log('Already processing', Event.User.Created, event);
            return;
        }

        this.activeOnCreatedEvents.add(eventKey);
        await UserBadgeService.addNewUserBadge(event.context);
        this.activeOnCreatedEvents.delete(eventKey);
    }

    public static async onSetup(event: Event.User.Event) {
        const eventKey = event.getKey();

        if (this.activeOnCreatedEvents.has(eventKey)) {
            console.log('Already processing', Event.User.Setup, event);
            return;
        }

        this.activeOnCreatedEvents.add(eventKey);
        await UserPostService.createNewUserPost(event.context);
        this.activeOnCreatedEvents.delete(eventKey);
    }

    public static async onUpdated(event: Event.User.Event) {
        const eventKey = event.getKey();

        if (this.activeOnUpdatedEvents.has(eventKey)) {
            console.log('Already processing', Event.User.Updated, event);
            return;
        }

        this.activeOnUpdatedEvents.add(eventKey);
        WebSocketService.emitUserUpdated(event.context);
        this.activeOnUpdatedEvents.delete(eventKey);
    }

    public static async onPremiumAdded(event: Event.User.Event) {
        const eventKey = event.getKey();

        if (this.activeOnPremiumAddedEvents.has(eventKey)) {
            console.log('Already processing', Event.User.PremiumAdded, event);
            return;
        }

        this.activeOnPremiumAddedEvents.add(eventKey);
        await UserBadgeService.addPremiumBadge(event.context);
        this.activeOnPremiumAddedEvents.delete(eventKey);
    }

    public static async onPremiumRemoved(event: Event.User.Event) {
        const eventKey = event.getKey();

        if (this.activeOnPremiumRemovedEvents.has(eventKey)) {
            console.log('Already processing', Event.User.PremiumRemoved, event);
            return;
        }

        this.activeOnPremiumRemovedEvents.add(eventKey);
        await UserBadgeService.removePremiumBadge(event.context);
        this.activeOnPremiumRemovedEvents.delete(eventKey);
    }

    public static async onAway(event: Event.User.Event) {
        const eventKey = event.getKey();

        if (this.activeOnAwayEvents.has(eventKey)) {
            console.log('Already processing', Event.User.Away, event);
            return;
        }

        this.activeOnAwayEvents.add(eventKey);
        await UserBadgeService.addAwayBadge(event.context);
        this.activeOnAwayEvents.delete(eventKey);
    }

    public static async onReturned(event: Event.User.Event) {
        const eventKey = event.getKey();

        if (this.activeOnReturnedEvents.has(eventKey)) {
            console.log('Already processing', Event.User.Returned, event);
            return;
        }

        this.activeOnReturnedEvents.add(eventKey);
        await UserBadgeService.removeAwayBadge(event.context);
        this.activeOnReturnedEvents.delete(eventKey);
    }
}
