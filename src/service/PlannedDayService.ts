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
import { Constants } from '@resources/types/constants/constants';
import { PlannedDayCommonService } from './common/PlannedDayCommonService';

interface ScheduledHabitTimeOfDay {
    scheduledHabit?: ScheduledHabit;
    timeOfDay?: TimeOfDay;
}

export class PlannedDayService {
    public static async getByUserIdAndDayKey(
        context: Context,
        userId: number,
        dayKey: string
    ): Promise<PlannedDayModel> {
        const plannedDay = await PlannedDayDao.getByUserAndDayKey(userId, dayKey);
        if (plannedDay) {
            const plannedDayModel: PlannedDayModel = ModelConverter.convert(plannedDay);
            return plannedDayModel;
        }

        throw new ServiceException(404, Code.PLANNED_DAY_NOT_FOUND, 'planned day not found');
    }

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
        const completionStatus = await this.getCompletionStatus(context, userId, dayKey);
        return completionStatus === Constants.CompletionState.COMPLETE;
    }

    public static async getCompletionStatus(
        context: Context,
        userId: number,
        dayKey: string
    ): Promise<Constants.CompletionState> {
        const plannedDay = await PlannedDayDao.getOrCreateByUserAndDayKey(userId, dayKey);

        if (plannedDay.date === undefined) {
            return Constants.CompletionState.INVALID;
        }

        const plannedDayModel: PlannedDay = ModelConverter.convert(plannedDay);

        const dayOfWeek = plannedDay?.date.getUTCDay() + 1 ?? 0;
        let scheduledHabits = await ScheduledHabitDao.getForUserAndDayOfWeekAndDate(
            userId,
            dayOfWeek,
            plannedDay.date
        );
        const scheduledHabitModels: ScheduledHabit[] = ModelConverter.convertAll(scheduledHabits);
        const completionState = PlannedDayCommonService.generateCompletionState(
            scheduledHabitModels,
            plannedDay.date,
            plannedDayModel
        );

        return completionState;
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

    public static async exists(context: Context, userId: number, dayKey: string): Promise<boolean> {
        const exists = await PlannedDayDao.existsByUserAndDayKey(userId, dayKey);
        return exists;
    }

    public static async getInDateRange(
        context: Context,
        userId: number,
        startDate: Date,
        endDate: Date
    ) {
        const plannedDays = await PlannedDayDao.getByUserInDateRange(userId, startDate, endDate);
        if (!plannedDays) {
            return [];
        }

        const plannedDayModels: PlannedDay[] = ModelConverter.convertAll(plannedDays);
        return plannedDayModels;
    }

    public static plannedDayIsComplete(scheduledHabits: ScheduledHabit[], plannedDay?: PlannedDay) {
        if (!plannedDay) {
            return false;
        }

        const plannedDayDayOfWeek = plannedDay.date!.getDay() + 1;
        const scheduledHabitsForDayOfWeek = scheduledHabits.filter(
            (scheduledHabit) =>
                scheduledHabit.daysOfWeek?.some((dayOfWeek) => dayOfWeek.id === plannedDayDayOfWeek)
        );

        const scheduledHabitCount = scheduledHabitsForDayOfWeek.reduce((acc, scheduledHabit) => {
            let timeOfDayCount = scheduledHabit.timesOfDay?.length ?? 0;
            if (timeOfDayCount === 0) {
                timeOfDayCount = 1;
            }

            return acc + timeOfDayCount;
        }, 0);

        const plannedTaskCount = plannedDay.plannedTasks?.length ?? 0;
        if (scheduledHabitCount !== plannedTaskCount) {
            return false;
        }

        const complete =
            (plannedDay.plannedTasks?.length ?? 0) > 0 &&
            plannedDay.plannedTasks?.every((task) => {
                if (task.status === Constants.HabitStatus.FAILED) {
                    return false;
                }

                if (task.status === Constants.HabitStatus.SKIPPED) {
                    return true;
                }

                if (task.active === false) {
                    return true;
                }

                return (task.completedQuantity ?? 0) >= (task.quantity ?? 1);
            });

        return complete;
    }

    public static async updateCompletionStatus(context: Context, plannedDayId: number) {
        const plannedDay = await this.getById(context, plannedDayId);
        if (!plannedDay?.dayKey) {
            throw new ServiceException(404, Code.PLANNED_DAY_NOT_FOUND, 'planned day not found');
        }

        const completionStatus = await this.getCompletionStatus(
            context,
            context.userId,
            plannedDay.dayKey
        );
        plannedDay.status = completionStatus;

        const updatedPlannedDay = await PlannedDayDao.update(plannedDay);
        return updatedPlannedDay;
    }

    public static async update(context: Context, plannedDay: PlannedDay) {
        const updatedPlannedDay = await PlannedDayDao.update(plannedDay);
        if (!updatedPlannedDay) {
            throw new ServiceException(
                500,
                Code.UPDATE_PLANNED_DAY_FAILED,
                'failed to update planned day'
            );
        }

        const plannedDayModel: PlannedDayModel = ModelConverter.convert(updatedPlannedDay);
        return plannedDayModel;
    }

    public static async getPlannedDayIdsForUser(
        context: Context,
        userId: number
    ): Promise<number[]> {
        const plannedDayKeys = await PlannedDayDao.getPlannedDayIdsForUser(userId);
        return plannedDayKeys;
    }

    public static async backPopulateCompletionStatuses(context: Context, userId: number) {
        const plannedDayIds = await PlannedDayService.getPlannedDayIdsForUser(context, userId);
        try {
            for (const plannedDayId of plannedDayIds) {
                await PlannedDayService.updateCompletionStatus(context, plannedDayId);
            }
        } catch (error) {
            console.error('Failed to back populate planned day completion statuses', error);
        }
    }
}
