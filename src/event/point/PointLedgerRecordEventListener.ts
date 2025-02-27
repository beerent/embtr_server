import { logger } from '@src/common/logger/Logger';
import eventBus from '../eventBus';
import { Event } from '../events';
import { PointLedgerRecordEventHandler } from './PointLedgerRecordEventHandler';

eventBus.on(Event.PointLedgerRecord.Updated, async (event: Event.PointLedgerRecord.Event) => {
    try {
        logger.info('PointLedgerRecord event received: ' + Event.PointLedgerRecord.Updated);
        PointLedgerRecordEventHandler.onUpdated(event);
    } catch (e) {
        console.error('error in' + Event.Like.Created, e);
    }
});
