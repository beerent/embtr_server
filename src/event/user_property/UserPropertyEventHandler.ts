import { Event } from '../events';

export class UserPropertyEventHandler {
    public static async onMissing(event: Event.UserProperty.Event) {
        switch (event.key) {
        }
    }
}
