import { Context } from '@src/general/auth/Context';
import eventBus from '../eventBus';
import { Event } from '../events';

export namespace PointLedgerRecordDispatcher {
    export const onUpdated = (context: Context) => {
        const event: Event.PointLedgerRecord.Event = new Event.PointLedgerRecord.Event(context);
        eventBus.emit(Event.PointLedgerRecord.UPDATED, event);
    };
}
