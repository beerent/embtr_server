import { ScheduledHabit } from '@resources/schema';
import { PlannedDayService } from '../PlannedDayService';

export class PlannedDayServiceV2 extends PlannedDayService {
    //@ Override
    protected static getPlannedDayByUserAndDayKey(scheduledHabitModels: ScheduledHabit[]) {
        const scheduledHabits = super.getPlannedDayByUserAndDayKey(scheduledHabitModels);

        scheduledHabits.forEach((scheduledHabit) => {
            if (!scheduledHabit.timeOfDay) {
                scheduledHabit.timeOfDay = {
                    id: 5,
                    period: 'DEFAULT',
                };
            }
        });

        return scheduledHabits;
    }
}
