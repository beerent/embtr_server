import { Context } from '@src/general/auth/Context';
import { PlannedDayService } from '@src/service/PlannedDayService';
import eventBus from './eventBus';

export namespace PlannedDayEvents {
    export namespace Type {
        export interface PlannedDayCompletionStatusUpdateEvent {
            context: Context;
            plannedDayId: number;
        }
    }

    export namespace Option {
        export const UPDATE_PLANNED_DAY_COMPLETION_STATUS = 'updatePlannedDayCompletionStatus';
    }
}

eventBus.on(
    PlannedDayEvents.Option.UPDATE_PLANNED_DAY_COMPLETION_STATUS,
    async (event: PlannedDayEvents.Type.PlannedDayCompletionStatusUpdateEvent) => {
        try {
            await PlannedDayService.updateCompletionStatus(event.context, event.plannedDayId);
        } catch (e) {
            console.error('Error updating planned day completion status', e);
        }
    }
);
