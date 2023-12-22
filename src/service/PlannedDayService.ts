import {
    PlannedTask as PlannedTaskModel,
    PlannedDay as PlannedDayModel,
    PlannedTask,
    ScheduledHabit,
    TimeOfDay,
    PlannedDay,
} from '@resources/schema';
import {
    CreatePlannedDayResponse,
    GetPlannedDayRequest,
    GetPlannedDayResponse,
} from '@resources/types/requests/PlannedDayTypes';
import {
    CREATE_PLANNED_DAY_FAILED,
    CREATE_PLANNED_DAY_FAILED_ALREADY_EXISTS,
    CREATE_PLANNED_DAY_SUCCESS,
    GET_PLANNED_DAY_FAILED_NOT_FOUND,
    GET_PLANNED_DAY_SUCCESS,
    SUCCESS,
} from '@src/common/RequestResponses';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { PlannedDayController } from '@src/controller/PlannedDayController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Request } from 'express';
import { ScheduledHabitController } from '@src/controller/ScheduledHabitController';
import { GetBooleanResponse } from '@resources/types/requests/GeneralTypes';

interface ScheduledHabitTimeOfDay {
    scheduledHabit?: ScheduledHabit;
    timeOfDay?: TimeOfDay;
}

export class PlannedDayService {
    public static async getById(id: number): Promise<GetPlannedDayResponse> {
        const plannedDay = await PlannedDayController.get(id);

        if (plannedDay) {
            const convertedPlannedDay: PlannedDayModel = ModelConverter.convert(plannedDay);
            return { ...GET_PLANNED_DAY_SUCCESS, plannedDay: convertedPlannedDay };
        }

        return GET_PLANNED_DAY_FAILED_NOT_FOUND;
    }

    public static async getIsComplete(request: GetPlannedDayRequest): Promise<GetBooleanResponse> {
        const plannedDay = await PlannedDayController.getOrCreateByUserAndDayKey(
            request.userId,
            request.dayKey
        );

        if (!plannedDay?.plannedTasks) {
            return { ...SUCCESS, result: false };
        }

        if (plannedDay.plannedTasks.length === 0) {
            return { ...SUCCESS, result: false };
        }

        // 1. get what SHOULD be completed for today
        const plannedDayDate = plannedDay?.date ?? new Date();
        const dayOfWeek = plannedDay?.date.getUTCDay() + 1 ?? 0;
        let scheduledHabits = await ScheduledHabitController.getForUserAndDayOfWeekAndDate(
            request.userId,
            dayOfWeek,
            plannedDayDate
        );

        // 2. get count of what SHOULD be completed for today
        const targetCount = scheduledHabits.reduce((acc, scheduledHabit) => {
            let timeOfDayCount = scheduledHabit.timesOfDay.length;
            if (timeOfDayCount === 0) {
                timeOfDayCount = 1;
            }

            return acc + timeOfDayCount;
        }, 0);

        // 3. get count of what IS completed for today
        const completedTasks = plannedDay.plannedTasks.filter(
            (plannedTask) => (plannedTask.completedQuantity ?? 0) >= (plannedTask.quantity ?? 1)
        );

        const removedTasks = plannedDay.plannedTasks.filter((plannedTask) => !plannedTask.active);

        const completedTaskCount = completedTasks.length + removedTasks.length;

        return { ...SUCCESS, result: completedTaskCount >= targetCount };
    }

    public static async getByUser(request: GetPlannedDayRequest): Promise<GetPlannedDayResponse> {
        const plannedDay = await PlannedDayController.getOrCreateByUserAndDayKey(
            request.userId,
            request.dayKey
        );
        const plannedDayModel: PlannedDay = ModelConverter.convert(plannedDay);

        const plannedDayDate = plannedDay?.date ?? new Date();
        const dayOfWeek = plannedDay?.date.getUTCDay() + 1 ?? 0;
        let scheduledHabits = await ScheduledHabitController.getForUserAndDayOfWeekAndDate(
            request.userId,
            dayOfWeek,
            plannedDayDate
        );

        const scheduledHabitModels: ScheduledHabit[] = ModelConverter.convertAll(scheduledHabits);

        // 1. find what tasks the user currently has
        // a mapping of each scheduled habit to all of their time of days
        const plannedScheduledHabitTimeOfDays: ScheduledHabitTimeOfDay[] =
            plannedDayModel.plannedTasks
                ? plannedDayModel.plannedTasks?.map((plannedTask) => {
                      return {
                          scheduledHabit: plannedTask.scheduledHabit ?? undefined,
                          timeOfDay: plannedTask.originalTimeOfDay ?? undefined,
                      };
                  })
                : [];

        // 2. find what tasks the user should have
        // scheduled habit id w/ time of day id for scheduled habits
        const scheduledHabitTimeOfDays: ScheduledHabitTimeOfDay[] = scheduledHabitModels.flatMap(
            (scheduledHabit) => {
                if (scheduledHabit.timesOfDay && scheduledHabit.timesOfDay.length > 0) {
                    return scheduledHabit.timesOfDay.map((timeOfDay) => {
                        const scheduledHabitTimeOfDay: ScheduledHabitTimeOfDay = {
                            scheduledHabit: scheduledHabit,
                            timeOfDay: timeOfDay,
                        };

                        return scheduledHabitTimeOfDay;
                    });
                } else {
                    const scheduledHabitTimeOfDay: ScheduledHabitTimeOfDay = {
                        scheduledHabit: scheduledHabit,
                        timeOfDay: undefined,
                    };

                    return [scheduledHabitTimeOfDay];
                }
            }
        );

        // 3. find what tasks the user should have but does not (the diff)
        // get all scheduled habits w/ time of day that do not exist in planned tasks
        const scheduledHabitsWithoutPlannedTasks: ScheduledHabitTimeOfDay[] =
            scheduledHabitTimeOfDays.filter((scheduledHabitTimeOfDay) => {
                return !plannedScheduledHabitTimeOfDays.some((plannedScheduledHabitTimeOfDay) => {
                    return (
                        scheduledHabitTimeOfDay.scheduledHabit?.id ===
                            plannedScheduledHabitTimeOfDay.scheduledHabit?.id &&
                        scheduledHabitTimeOfDay.timeOfDay?.id ===
                            plannedScheduledHabitTimeOfDay.timeOfDay?.id
                    );
                });
            });

        // 4. create placeholder planned tasks from the diff
        const placeHolderPlannedTasks: PlannedTask[] = [];
        for (const timeOfDayScheduledHabit of scheduledHabitsWithoutPlannedTasks) {
            const placeHolderPlannedTask: PlannedTask = {
                plannedDayId: plannedDay?.id,
                scheduledHabitId: timeOfDayScheduledHabit.scheduledHabit?.id,
                title: timeOfDayScheduledHabit.scheduledHabit?.task?.title,
                description: timeOfDayScheduledHabit.scheduledHabit?.description ?? '',
                remoteImageUrl: timeOfDayScheduledHabit.scheduledHabit?.task?.remoteImageUrl ?? '',
                localImage: timeOfDayScheduledHabit.scheduledHabit?.task?.localImage ?? '',
                unitId: timeOfDayScheduledHabit.scheduledHabit?.unitId ?? 0,
                unit: timeOfDayScheduledHabit.scheduledHabit?.unit ?? undefined,
                quantity: timeOfDayScheduledHabit.scheduledHabit?.quantity ?? 1,
                timeOfDayId: timeOfDayScheduledHabit.timeOfDay?.id,
                timeOfDay: timeOfDayScheduledHabit.timeOfDay,
                originalTimeOfDayId: timeOfDayScheduledHabit.timeOfDay?.id,
                originalTimeOfDay: timeOfDayScheduledHabit.timeOfDay,
                completedQuantity: 0,
                active: true,
            };

            placeHolderPlannedTasks.push(placeHolderPlannedTask);
        }

        if (!plannedDay) {
            return GET_PLANNED_DAY_FAILED_NOT_FOUND;
        }

        const convertedPlannedDay: PlannedDayModel = ModelConverter.convert(plannedDay);
        convertedPlannedDay.plannedTasks = [
            ...(convertedPlannedDay.plannedTasks?.filter((plannedTask) => plannedTask.active) ??
                []),
            ...placeHolderPlannedTasks,
        ];

        return { ...GET_PLANNED_DAY_SUCCESS, plannedDay: convertedPlannedDay };
    }

    public static async create(request: Request): Promise<CreatePlannedDayResponse> {
        const userId: number = (await AuthorizationController.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        const dayKey = request.body.dayKey;

        const preExistingDayKey = await PlannedDayController.getByUserAndDayKey(userId, dayKey);
        if (preExistingDayKey) {
            return CREATE_PLANNED_DAY_FAILED_ALREADY_EXISTS;
        }

        const createdPlannedDay = await PlannedDayController.create(userId, dayKey);
        if (createdPlannedDay) {
            const convertedPlannedDay: PlannedDayModel = ModelConverter.convert(createdPlannedDay);
            return { ...CREATE_PLANNED_DAY_SUCCESS, plannedDay: convertedPlannedDay };
        }

        return CREATE_PLANNED_DAY_FAILED;
    }
}
