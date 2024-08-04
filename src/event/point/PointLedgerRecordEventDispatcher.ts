import { Constants } from '@resources/types/constants/constants';
import { Context } from '@src/general/auth/Context';
import eventBus from '../eventBus';
import { Event } from '../events';

export namespace PointLedgerRecordDispatcher {
    export const onUpdated = (
        context: Context,
        relevantId: number,
        pointDefinitionType: Constants.PointDefinitionType,
        points: number
    ) => {
        const event: Event.PointLedgerRecord.Event = new Event.PointLedgerRecord.Event(
            context,
            relevantId,
            pointDefinitionType,
            points
        );
        eventBus.emit(Event.PointLedgerRecord.Updated, event);
    };
}
