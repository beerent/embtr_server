import { ScheduledHabit } from '@resources/schema';

export interface ScheduledHabitTransformationService {
    transformIn: <T extends ScheduledHabit | T[]>(scheduledHabit: T) => T;
    transformOut: <T extends ScheduledHabit | T[]>(scheduledHabit: T) => T;
}

export class ScheduledHabitTransformationServiceDefault
    implements ScheduledHabitTransformationService {
    public transformIn<T extends ScheduledHabit | T[]>(scheduledHabit: T): T {
        return scheduledHabit;
    }

    public transformOut<T extends ScheduledHabit | T[]>(scheduledHabit: T): T {
        return scheduledHabit;
    }
}

export class ScheduledHabitTransformationServiceV1 implements ScheduledHabitTransformationService {
    public transformIn<T extends ScheduledHabit | T[]>(scheduledHabit: T): T {
        if (Array.isArray(scheduledHabit)) {
            return scheduledHabit.map((item) => this.transformIn(item)) as T;
        }

        const transformedScheduledHabit = { ...scheduledHabit } as ScheduledHabit;
        if (
            !transformedScheduledHabit.timesOfDay ||
            transformedScheduledHabit.timesOfDay.length === 0
        ) {
            transformedScheduledHabit.timesOfDay = [
                {
                    id: 5,
                    period: 'DEFAULT',
                },
            ];
        }

        return transformedScheduledHabit as T;
    }

    public transformOut<T>(scheduledHabit: T): T {
        if (Array.isArray(scheduledHabit)) {
            return scheduledHabit.map((item) => this.transformOut(item)) as T;
        }

        const transformedScheduledHabit = { ...scheduledHabit } as ScheduledHabit;
        if (transformedScheduledHabit.timesOfDay?.some((timeOfDay) => timeOfDay.id === 5)) {
            transformedScheduledHabit.timesOfDay = undefined;
        }

        return transformedScheduledHabit as T;
    }
}
