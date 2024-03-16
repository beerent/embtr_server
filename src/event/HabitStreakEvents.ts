import { Context } from '@src/general/auth/Context';
import { HabitStreakService } from '@src/service/HabitStreakService';
import { PlannedDayService } from '@src/service/PlannedDayService';
import eventBus from './eventBus';

export namespace HabitStreakEvents {
    export namespace Type {
        export interface FullPopulateCurrentStreakEvent {
            context: Context;
            userId: number;
        }
    }

    export namespace Option {
        export const FULL_POPULATE_CURRENT_STREAK = 'FULL_POPULATE_CURRENT_STREAK';
    }
}

eventBus.on(
    HabitStreakEvents.Option.FULL_POPULATE_CURRENT_STREAK,
    async (event: HabitStreakEvents.Type.FullPopulateCurrentStreakEvent) => {
        try {
            await PlannedDayService.backPopulateCompletionStatuses(event.context, event.userId);
            await HabitStreakService.fullPopulateCurrentStreak(event.context, event.userId);
        } catch (e) {
            console.error('Error updating planned day completion status', e);
        }
    }
);
