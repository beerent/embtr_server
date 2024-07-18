import { LevelDetails } from '@resources/types/dto/Level';
import { Context } from '@src/general/auth/Context';
import eventBus from '../eventBus';
import { Event } from '../events';

export namespace LevelEventDispatcher {
    export const onUpdated = (context: Context, levelDetails: LevelDetails) => {
        const event: Event.Level.Event = new Event.Level.Event(context, levelDetails);
        eventBus.emit(Event.Level.Updated, event);
    };
}
