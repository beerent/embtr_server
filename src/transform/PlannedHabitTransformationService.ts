import { PlannedTask } from '@resources/schema';

type MaybeArray<T> = T | T[];
type MaybePlannedTask = MaybeArray<PlannedTask>;

const DEFEAULT_TIME_OF_DAY_ID = 5;

export interface PlannedHabitTransformationService {
    transformIn: <T extends MaybePlannedTask>(t: T) => T;
    transformOut: <T extends MaybePlannedTask>(t: T) => T;
}

export class PlannedHabitTransformationServiceDefault implements PlannedHabitTransformationService {
    public transformIn<T extends MaybePlannedTask>(t: T): T {
        return t;
    }

    public transformOut<T extends MaybePlannedTask>(t: T): T {
        return t;
    }
}

export class PlannedHabitTransformationServiceV1 implements PlannedHabitTransformationService {
    public transformIn<T extends MaybePlannedTask>(t: T): T {
        return t;
    }

    public transformOut<T extends MaybePlannedTask>(t: T): T {
        if (Array.isArray(t)) {
            return t.map((item) => this.transformOut(item)) as T;
        }

        const transformedPlannedTask = { ...t } as PlannedTask;

        // transform time of day from default to undefined
        if (transformedPlannedTask.timeOfDayId === DEFEAULT_TIME_OF_DAY_ID) {
            transformedPlannedTask.timeOfDayId = undefined;
            transformedPlannedTask.timeOfDay = undefined;
        }

        // transform scheduled habit from default to undefined
        if (
            transformedPlannedTask.scheduledHabit?.timesOfDay?.some(
                (timeOfDay) => timeOfDay.id === DEFEAULT_TIME_OF_DAY_ID
            )
        ) {
            transformedPlannedTask.scheduledHabit.timesOfDay = [];
        }

        return transformedPlannedTask as T;
    }
}
