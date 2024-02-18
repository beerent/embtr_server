import { PlannedDay } from '@resources/schema';
import { PlannedHabitTransformationServiceV1 } from './PlannedHabitTransformationService';

export interface PlannedDayTransformationService {
    transformIn: (plannedDay: PlannedDay) => PlannedDay;
    transformOut: (plannedDay: PlannedDay) => PlannedDay;
}

export class PlannedDayTransformationServiceDefault implements PlannedDayTransformationService {
    public transformIn(plannedDay: PlannedDay): PlannedDay {
        return plannedDay;
    }

    public transformOut(plannedDay: PlannedDay): PlannedDay {
        return plannedDay;
    }
}

export class PlannedDayTransformationServiceV1 implements PlannedDayTransformationService {
    private plannedHabitTransformationService = new PlannedHabitTransformationServiceV1();

    public transformIn(plannedDay: PlannedDay): PlannedDay {
        if (!plannedDay.plannedTasks) {
            return plannedDay;
        }

        plannedDay.plannedTasks = this.plannedHabitTransformationService.transformIn(
            plannedDay.plannedTasks
        );
        return plannedDay;
    }

    public transformOut(plannedDay: PlannedDay): PlannedDay {
        if (!plannedDay.plannedTasks) {
            return plannedDay;
        }

        plannedDay.plannedTasks = this.plannedHabitTransformationService.transformOut(
            plannedDay.plannedTasks
        );
        return plannedDay;
    }
}
