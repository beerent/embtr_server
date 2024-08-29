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
import { PlannedDayEventDispatcher } from '@src/event/planned_day/PlannedDayEventDispatcher';
import { PlannedHabitService } from './PlannedHabitService';
import { PlannedHabitDao } from '@src/database/PlannedHabitDao';
import { DeprecatedImageUtility } from '@src/utility/DeprecatedImageUtility';
import { ContextService } from './ContextService';
const AsyncLock = require('async-lock');

interface ScheduledHabitTimeOfDay {
    scheduledHabit?: ScheduledHabit;
    timeOfDay?: TimeOfDay;
}

export class PlannedDayService {
    private static lock = new AsyncLock();

    public static async getOrCreate(
        context: Context,
        userId: number,
        dayKey: string
    ): Promise<PlannedDay | undefined> {
        const exists = await PlannedDayService.exists(context, userId, dayKey);

        let plannedDay;
        if (exists) {
            plannedDay = await PlannedDayService.getByUserIdAndDayKey(context, userId, dayKey);
        } else {
            plannedDay = PlannedDayService.create(context, userId, dayKey);
        }

        return plannedDay;
    }

    public static async getByUserIdAndDayKey(
        context: Context,
        userId: number,
        dayKey: string
    ): Promise<PlannedDayModel | undefined> {
        const plannedDay = await PlannedDayDao.getByUserAndDayKey(userId, dayKey);
        if (!plannedDay) {
            return undefined;
        }

        const plannedDayModel: PlannedDayModel = ModelConverter.convert(plannedDay);
        return plannedDayModel;
    }

    public static async getById(context: Context, id: number): Promise<PlannedDayModel> {
        const plannedDay = await PlannedDayDao.get(id);

        if (plannedDay) {
            const plannedDayModel: PlannedDayModel = ModelConverter.convert(plannedDay);
            return plannedDayModel;
        }

        throw new ServiceException(404, Code.PLANNED_DAY_NOT_FOUND, 'user not found');
    }

    public static async getByUser(
        context: Context,
        userId: number,
        dayKey: string
    ): Promise<PlannedDay | undefined> {
        const plannedDay = await PlannedDayDao.getByUserAndDayKey(userId, dayKey);
        if (!plannedDay) {
            return undefined;
        }

        const plannedDayModel: PlannedDay = ModelConverter.convert(plannedDay);

        //deprecated in 4.0.13
        plannedDayModel.plannedTasks?.forEach((plannedTask) => {
            DeprecatedImageUtility.setPlannedTaskImages(plannedTask);
        });

        return plannedDayModel;
    }

    public static async getIsComplete(
        context: Context,
        userId: number,
        dayKey: string
    ): Promise<boolean> {
        const completionStatus = await this.generateCompletionStatus(context, userId, dayKey);
        return completionStatus === Constants.CompletionState.COMPLETE;
    }

    public static async getCompletionStatus(
        context: Context,
        userId: number,
        dayKey: string
    ): Promise<Constants.CompletionState | undefined> {
        const exists = await PlannedDayDao.existsByUserAndDayKey(userId, dayKey);
        if (!exists) {
            return undefined;
        }

        const plannedDay = await PlannedDayDao.getByUserAndDayKey(userId, dayKey);
        return plannedDay?.status ? Constants.getCompletionState(plannedDay.status) : undefined;
    }

    public static async generateCompletionStatus(
        context: Context,
        userId: number,
        dayKey: string
    ): Promise<Constants.CompletionState | undefined> {
        const plannedDay = await PlannedDayDao.getByUserAndDayKey(userId, dayKey);
        if (!plannedDay) {
            return Constants.CompletionState.INVALID;
        }

        const plannedHabits = await PlannedHabitDao.getAllByPlannedDayId(plannedDay.id);
        const plannedHabitModels: PlannedTask[] = ModelConverter.convertAll(plannedHabits);

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
            plannedHabitModels
        );

        return completionState;
    }

    public static async getFullyPopulatedByUser(
        context: Context,
        userId: number,
        dayKey: string
    ): Promise<PlannedDay | undefined> {
        const plannedDay = await this.getByUser(context, userId, dayKey);
        if (!plannedDay) {
            return undefined;
        }

        const populatedPlannedDay = await this.populatePlannedDay(context, userId, plannedDay);
        return populatedPlannedDay;
    }

    public static async getFullyPopulatedPlaceholderByUser(
        context: Context,
        userId: number,
        dayKey: string
    ): Promise<PlannedDay> {
        const plannedDay: PlannedDay = {
            id: 0,
            userId: userId,
            date: new Date(dayKey),
            dayKey: dayKey,
            plannedTasks: [],
        };

        const populatedPlannedDay = await this.populatePlannedDay(context, userId, plannedDay);
        return populatedPlannedDay;
    }

    public static async create(
        context: Context,
        userId: number,
        dayKey: string
    ): Promise<PlannedDay> {
        const preExistingDayKey = await PlannedDayDao.getByUserAndDayKey(userId, dayKey);
        if (preExistingDayKey) {
            throw new ServiceException(
                409,
                Code.PLANNED_DAY_FAILED_ALREADY_EXISTS,
                'planned day already exists'
            );
        }

        const createdPlannedDay = await PlannedDayDao.create(userId, dayKey);
        if (!createdPlannedDay) {
            throw new ServiceException(
                500,
                Code.CREATE_PLANNED_DAY_FAILED,
                'failed to create planned day'
            );
        }

        const plannedDayWithData = await this.getFullyPopulatedByUser(context, userId, dayKey);
        if (!plannedDayWithData) {
            throw new ServiceException(404, Code.PLANNED_DAY_NOT_FOUND, 'planned day not found');
        }

        return plannedDayWithData;
    }

    public static async exists(context: Context, userId: number, dayKey: string): Promise<boolean> {
        const exists = await PlannedDayDao.existsByUserAndDayKey(userId, dayKey);
        return exists;
    }

    public static async getAllInDateRange(
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
                if (task.status === Constants.CompletionState.FAILED) {
                    return false;
                }

                if (task.status === Constants.CompletionState.SKIPPED) {
                    return true;
                }

                if (task.active === false) {
                    return true;
                }

                return (task.completedQuantity ?? 0) >= (task.quantity ?? 1);
            });

        return complete;
    }

    public static async updateCompletionStatusByDayKey(context: Context, dayKey: string) {
        const plannedDay = await PlannedDayService.getByUserIdAndDayKey(
            context,
            context.userId,
            dayKey
        );

        // no status to update if the planned day does not exist
        if (!plannedDay?.id) {
            return;
        }

        try {
            this.updateCompletionStatusByPlannedDayId(context, plannedDay.id);
        } catch (error) {
            console.error('error updating planned day', plannedDay.id);
        }
    }

    public static async updateCompletionStatusByPlannedHabitId(
        context: Context,
        plannedHabitId: number
    ) {
        const plannedHabit = await PlannedHabitService.getById(context, plannedHabitId);
        if (!plannedHabit?.scheduledHabitId) {
            throw new ServiceException(404, Code.PLANNED_TASK_NOT_FOUND, 'planned habit not found');
        }

        if (!plannedHabit?.plannedDayId) {
            throw new ServiceException(404, Code.PLANNED_DAY_NOT_FOUND, 'planned day not found');
        }

        const updatedPlannedDay = await this.updateCompletionStatusByPlannedDayId(
            context,
            plannedHabit.plannedDayId
        );
    }

    public static async updateCompletionStatusByPlannedDayId(
        context: Context,
        plannedDayId: number
    ) {
        const plannedDay = await this.getById(context, plannedDayId);
        if (!plannedDay?.dayKey || !plannedDay?.userId) {
            throw new ServiceException(404, Code.PLANNED_DAY_NOT_FOUND, 'planned day not found');
        }

        if (plannedDay.status === Constants.CompletionState.AWAY) {
            return plannedDay;
        }

        const oldStatus = plannedDay.status;
        const newStatus = await this.generateCompletionStatus(
            context,
            plannedDay.userId,
            plannedDay.dayKey
        );

        if (oldStatus === newStatus) {
            return plannedDay;
        }

        if (
            (newStatus && oldStatus === Constants.CompletionState.COMPLETE) ||
            newStatus === Constants.CompletionState.COMPLETE
        ) {
            this.dispatchCompletionStatusChanged(context, plannedDay, newStatus);
        }

        plannedDay.status = newStatus;
        const updatedPlannedDay = await this.update(context, plannedDay);
        return updatedPlannedDay;
    }

    public static async update(context: Context, plannedDay: PlannedDay) {
        const userId = context.userId;
        const plannedTaskId = plannedDay.id;
        const key = `update-${userId}-${plannedTaskId}`;

        return this.lock.acquire(key, async () => {
            if (!plannedDay.dayKey || !plannedDay.id || !plannedDay.userId) {
                throw new ServiceException(400, Code.INVALID_REQUEST, 'planned day is malformed');
            }

            const updatedPlannedDay = await PlannedDayDao.update(plannedDay);
            if (!updatedPlannedDay) {
                throw new ServiceException(
                    500,
                    Code.UPDATE_PLANNED_DAY_FAILED,
                    'failed to update planned day'
                );
            }

            const userContext = ContextService.contextToUserContext(context);
            PlannedDayEventDispatcher.onUpdated(
                userContext,
                plannedDay.userId,
                plannedDay.dayKey,
                plannedDay.id
            );

            const plannedDayModel: PlannedDayModel = ModelConverter.convert(updatedPlannedDay);
            return plannedDayModel;
        });
    }

    public static async getPlannedDayIdsForUser(
        context: Context,
        userId: number
    ): Promise<number[]> {
        const plannedDayIds = await PlannedDayDao.getPlannedDayIdsForUser(userId);
        return plannedDayIds;
    }

    public static async getPlannedDayIdsWithMissingStatusesForUser(
        context: Context,
        userId: number
    ): Promise<number[]> {
        const plannedDayIds =
            await PlannedDayDao.getPlannedDayIdsWithMissingStatusesForUser(userId);
        return plannedDayIds;
    }

    public static async countComplete(context: Context): Promise<number> {
        const count = await PlannedDayDao.countComplete(context.userId);
        return count;
    }

    public static async backPopulateCompletionStatuses(context: Context, userId: number) {
        const plannedDayIds = await PlannedDayService.getPlannedDayIdsForUser(context, userId);
        for (const plannedDayId of plannedDayIds) {
            try {
                await this.updateCompletionStatusByPlannedDayId(context, plannedDayId);
            } catch (error) {
                console.error('error updating planned day', plannedDayId);
            }
        }
    }

    public static async backPopulateMissingCompletionStatuses(context: Context, userId: number) {
        const plannedDayIds = await PlannedDayService.getPlannedDayIdsWithMissingStatusesForUser(
            context,
            userId
        );

        for (const plannedDayId of plannedDayIds) {
            try {
                await this.updateCompletionStatusByPlannedDayId(context, plannedDayId);
            } catch (error) {
                console.error('error updating planned day', plannedDayId);
            }
        }
    }

    private static async populatePlannedDay(
        context: Context,
        userId: number,
        plannedDay: PlannedDay
    ): Promise<PlannedDay> {
        const plannedDayDate = plannedDay?.date ?? new Date();
        const dayOfWeek = plannedDay.date!.getUTCDay() + 1 ?? 0;
        let scheduledHabits = await ScheduledHabitDao.getForUserAndDayOfWeekAndDate(
            userId,
            dayOfWeek,
            plannedDayDate
        );

        const scheduledHabitModels: ScheduledHabit[] = ModelConverter.convertAll(scheduledHabits);

        // 1. find what tasks the user currently has
        // a mapping of each scheduled habit to all of their time of days
        const plannedScheduledHabitTimeOfDays: ScheduledHabitTimeOfDay[] = plannedDay.plannedTasks
            ? plannedDay.plannedTasks?.map((plannedTask) => {
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
                scheduledHabit: {
                    task: {
                        type: timeOfDayScheduledHabit.scheduledHabit?.task?.type,
                    },
                    timesOfDay: timeOfDayScheduledHabit.scheduledHabit?.timesOfDay,
                },
                title: ScheduledHabitUtil.getTitle(timeOfDayScheduledHabit.scheduledHabit),
                description: ScheduledHabitUtil.getDescription(
                    timeOfDayScheduledHabit.scheduledHabit
                ),
                icon: ScheduledHabitUtil.getIcon(timeOfDayScheduledHabit.scheduledHabit),
                remoteImageUrl: ScheduledHabitUtil.getIcon(timeOfDayScheduledHabit.scheduledHabit)
                    ?.remoteImageUrl,
                localImage: ScheduledHabitUtil.getIcon(timeOfDayScheduledHabit.scheduledHabit)
                    ?.localImage,
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

        const clonedPlannedDay = { ...plannedDay };
        clonedPlannedDay.plannedTasks = [
            ...(clonedPlannedDay.plannedTasks?.filter((plannedTask) => plannedTask.active) ?? []),
            ...placeHolderPlannedTasks,
        ];

        clonedPlannedDay.plannedTasks = clonedPlannedDay.plannedTasks?.sort((a, b) => {
            return (a.scheduledHabitId ?? 0) - (b.scheduledHabitId ?? 0);
        });

        return clonedPlannedDay;
    }

    private static dispatchCompletionStatusChanged(
        context: Context,
        plannedDay: PlannedDay,
        completionState: Constants.CompletionState
    ) {
        if (!plannedDay.dayKey || !plannedDay.id) {
            return;
        }

        const userContext = ContextService.contextToUserContext(context);
        if (completionState === Constants.CompletionState.COMPLETE) {
            PlannedDayEventDispatcher.onCompleted(userContext, plannedDay.dayKey, plannedDay.id);
        } else {
            PlannedDayEventDispatcher.onIncompleted(userContext, plannedDay.dayKey, plannedDay.id);
        }
    }
}
