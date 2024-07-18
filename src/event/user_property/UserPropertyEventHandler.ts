import { Constants } from '@resources/types/constants/constants';
import { LevelService } from '@src/service/feature/LevelService';
import { WebSocketService } from '@src/service/WebSocketService';
import { Event } from '../events';

export class UserPropertyEventHandler {
    private static activeOnMissingEvents = new Set<string>();
    private static activeOnUpdatedEvents = new Set<string>();

    public static async onMissing(event: Event.UserProperty.Event) { }

    public static async onUpdated(event: Event.UserProperty.Event) {
        switch (event.key) {
            case Constants.UserPropertyKey.POINTS:
                LevelService.recalculateLevel(event.context, Number(event.value ?? '0'));
                break;
        }
    }
}
