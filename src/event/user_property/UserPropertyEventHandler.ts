import { Event } from '../events';

export class UserPropertyEventHandler {
    private static activeOnMissingEvents = new Set<string>();

    public static async onMissing(event: Event.UserProperty.Event) {
        switch (event.key) {
        }
    }
}
