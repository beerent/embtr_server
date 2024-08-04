import { Constants } from '@resources/types/constants/constants';
import { Context } from '@src/general/auth/Context';
import { LevelService } from '@src/service/LevelService';
import { PointLedgerService } from '@src/service/PointLedgerService';
import { WebSocketService } from '@src/service/WebSocketService';
import { WebSocketUtility } from '@src/utility/web_socket/WebSocketUtility';
import { Event } from '../events';
const AsyncLock = require('async-lock');

export class PointLedgerRecordEventHandler {
    private static lock = new AsyncLock();

    public static async onUpdated(event: Event.PointLedgerRecord.Event) {
        const eventKey = event.getKey();

        WebSocketUtility.emitPlannedDay(event.context, event.pointDefinitionType, event.points);
        await PointLedgerService.recalculatePoints(event.context);
        await LevelService.recalculateLevel(event.context);

        // lock is needed to batch points gained events
        return this.lock.acquire(eventKey, async () => {
            await LevelService.emitLevelDetailsUpdated(event.context);
        });
    }
}
