import {
    PlannedDay as PlannedDayModel,
    PlannedTask,
    ScheduledHabit,
    TimeOfDay,
    PlannedDay,
} from '@resources/schema';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { PlannedDayDao } from '@src/database/PlannedDayDao';
import { ScheduledHabitDao } from '@src/database/ScheduledHabitDao';
import { ServiceException } from '@src/general/exception/ServiceException';
import { Code } from '@resources/codes';
import { Context } from '@src/general/auth/Context';
import { ScheduledHabitUtil } from '@src/utility/ScheduledHabitUtil';

interface ScheduledHabitTimeOfDay {
    scheduledHabit?: ScheduledHabit;
    timeOfDay?: TimeOfDay;
}

export class PlannedDayService {
    public static async getById(context: Context, id: number): Promise<PlannedDayModel> {
        const plannedDay = await PlannedDayDao.get(id);

        if (plannedDay) {
            const plannedDayModel: PlannedDayModel = ModelConverter.convert(plannedDay);
            return plannedDayModel;
        }

        throw new ServiceException(404, Code.PLANNED_DAY_NOT_FOUND, 'user not found');
    }

    public static async getIsComplete(
        context: Context,
        userId: number,
        dayKey: string
    ): Promise<boolean> {
        const plannedDay = await PlannedDayDao.getOrCreateByUserAndDayKey(userId, dayKey);

        if (!plannedDay?.plannedTasks) {
            return false;
        }

        if (plannedDay.plannedTasks.length === 0) {
            return false;
        }

        // 1. get what SHOULD be completed for today
        const plannedDayDate = plannedDay?.date ?? new Date();
        const dayOfWeek = plannedDay?.date.getUTCDay() + 1 ?? 0;
        let scheduledHabits = await ScheduledHabitDao.getForUserAndDayOfWeekAndDate(
            userId,
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

        return completedTaskCount >= targetCount;
    }

    public static async getByUser(
        context: Context,
        userId: number,
        dayKey: string
    ): Promise<PlannedDay> {
        const plannedDay = await PlannedDayDao.getOrCreateByUserAndDayKey(userId, dayKey);
        if (!plannedDay) {
            throw new ServiceException(404, Code.PLANNED_DAY_NOT_FOUND, 'planned day not found');
        }

        const plannedDayModel: PlannedDay = ModelConverter.convert(plannedDay);

        const plannedDayDate = plannedDay?.date ?? new Date();
        const dayOfWeek = plannedDay?.date.getUTCDay() + 1 ?? 0;
        let scheduledHabits = await ScheduledHabitDao.getForUserAndDayOfWeekAndDate(
            userId,
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
                title: ScheduledHabitUtil.getTitle(timeOfDayScheduledHabit.scheduledHabit),
                description: ScheduledHabitUtil.getDescription(
                    timeOfDayScheduledHabit.scheduledHabit
                ),
                remoteImageUrl: ScheduledHabitUtil.getRemoteImageUrl(
                    timeOfDayScheduledHabit.scheduledHabit
                ),
                localImage: ScheduledHabitUtil.getLocalImage(
                    timeOfDayScheduledHabit.scheduledHabit
                ),
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

        const convertedPlannedDay: PlannedDayModel = ModelConverter.convert(plannedDay);
        convertedPlannedDay.plannedTasks = [
            ...(convertedPlannedDay.plannedTasks?.filter((plannedTask) => plannedTask.active) ??
                []),
            ...placeHolderPlannedTasks,
        ];

        convertedPlannedDay.plannedTasks = convertedPlannedDay.plannedTasks?.sort((a, b) => {
            if (a.timeOfDay === b.timeOfDay) {
                return 0;
            }

            const aRank = a.timeOfDay?.id === undefined ? 0 : a.timeOfDay.id;
            const bRank = b.timeOfDay?.id === undefined ? 0 : b.timeOfDay.id;
            return aRank < bRank ? -1 : 1;
        });

        return convertedPlannedDay;
    }

    public static async create(context: Context, dayKey: string): Promise<PlannedDay> {
        const preExistingDayKey = await PlannedDayDao.getByUserAndDayKey(context.userId, dayKey);
        if (preExistingDayKey) {
            throw new ServiceException(
                409,
                Code.PLANNED_DAY_FAILED_ALREADY_EXISTS,
                'planned day already exists'
            );
        }

        const createdPlannedDay = await PlannedDayDao.create(context.userId, dayKey);
        if (!createdPlannedDay) {
            throw new ServiceException(
                500,
                Code.CREATE_PLANNED_DAY_FAILED,
                'failed to create planned day'
            );
        }

        const plannedDayModel: PlannedDayModel = ModelConverter.convert(createdPlannedDay);
        return plannedDayModel;
    }
}
