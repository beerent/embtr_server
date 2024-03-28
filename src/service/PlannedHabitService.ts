import { PlannedTask } from '@resources/schema';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Constants } from '@resources/types/constants/constants';
import { PlannedDayDao } from '@src/database/PlannedDayDao';
import { PlannedHabitDao } from '@src/database/PlannedHabitDao';
import { ServiceException } from '@src/general/exception/ServiceException';
import { Code } from '@resources/codes';
import { Context } from '@src/general/auth/Context';
import { PlannedHabitEventDispatcher } from '@src/event/planned_habit/PlannedHabitEventDispatcher';

export class PlannedHabitService {
    public static async getById(context: Context, id: number): Promise<PlannedTask> {
        const plannedHabit = await PlannedHabitDao.get(id);
        if (!plannedHabit) {
            throw new ServiceException(404, Code.PLANNED_TASK_NOT_FOUND, 'planned habit not found');
        }

        const plannedHabitModel: PlannedTask = ModelConverter.convert(plannedHabit);
        return plannedHabitModel;
    }

    public static async getAllByPlannedDayId(
        context: Context,
        plannedDayId: number
    ): Promise<PlannedTask[]> {
        const plannedHabits = await PlannedHabitDao.getAllByPlannedDayId(plannedDayId);
        const plannedHabitModels: PlannedTask[] = plannedHabits.map((plannedHabit) =>
            ModelConverter.convert(plannedHabit)
        );
        return plannedHabitModels;
    }

    public static async createOrUpdate(
        context: Context,
        dayKey: string,
        plannedTask: PlannedTask
    ): Promise<PlannedTask> {
        if (plannedTask.id) {
            return this.update(context, plannedTask);
        }

        const existingId = await this.getIdByUniqueData(
            plannedTask.plannedDayId,
            plannedTask.scheduledHabitId,
            plannedTask.timeOfDayId
        );

        if (existingId) {
            plannedTask.id = existingId;
            return this.update(context, plannedTask);
        }

        return this.create(context, dayKey, plannedTask);
    }

    public static async create(
        context: Context,
        dayKey: string,
        plannedTask: PlannedTask
    ): Promise<PlannedTask> {
        const plannedDay = await PlannedDayDao.getOrCreateByUserAndDayKey(context.userId, dayKey);
        if (!plannedDay || plannedDay.userId !== context.userId) {
            throw new ServiceException(404, Code.PLANNED_DAY_NOT_FOUND, 'planned day not found');
        }
        plannedTask.plannedDayId = plannedDay.id;

        const createdPlannedTask = await PlannedHabitDao.create(plannedTask);
        if (!createdPlannedTask) {
            throw new ServiceException(
                500,
                Code.PLANNED_TASK_NOT_FOUND,
                'failed to create planned task'
            );
        }

        PlannedHabitEventDispatcher.onCreated(context, createdPlannedTask.id);

        const plannedTaskModel: PlannedTask = ModelConverter.convert(createdPlannedTask);
        return plannedTaskModel;
    }

    public static async update(context: Context, plannedTask: PlannedTask): Promise<PlannedTask> {
        const existingPlannedTask = await PlannedHabitDao.get(plannedTask.id!);
        if (!existingPlannedTask) {
            throw new ServiceException(404, Code.PLANNED_TASK_NOT_FOUND, 'planned task not found');
        }

        if (existingPlannedTask.plannedDay.userId !== context.userId) {
            throw new ServiceException(403, Code.FORBIDDEN, 'user does not have permission');
        }

        plannedTask.status = this.getUpdatedStatus(plannedTask);
        plannedTask.timeOfDayId = plannedTask.timeOfDayId ?? 5;

        const updatedPlannedTask = await PlannedHabitDao.update(plannedTask);
        if (!updatedPlannedTask) {
            throw new ServiceException(
                500,
                Code.PLANNED_TASK_NOT_FOUND,
                'failed to update planned task'
            );
        }

        PlannedHabitEventDispatcher.onUpdated(context, existingPlannedTask.id);

        const updatedPlannedTaskModel: PlannedTask = ModelConverter.convert(updatedPlannedTask);
        // const completedChallenges =
        //     await ChallengeService.updateChallengeRequirementProgress(updatedPlannedTaskModel);

        return updatedPlannedTaskModel;
    }

    public static async existsByDayKeyAndScheduledHabitId(
        context: Context,
        dayKey: string,
        scheduledHabitId: number
    ): Promise<boolean> {
        const plannedDay = await PlannedDayDao.getByUserAndDayKey(context.userId, dayKey);
        if (!plannedDay) {
            return false;
        }

        const exists = plannedDay.plannedTasks.some((plannedTask) => {
            return plannedTask.scheduledHabitId === scheduledHabitId;
        });

        return exists;
    }

    public static async count(context: Context): Promise<number> {
        return await PlannedHabitDao.count(context.userId);
    }

    private static getUpdatedStatus(plannedTask: PlannedTask): string {
        if (
            (plannedTask.status ?? Constants.CompletionState.INCOMPLETE) ===
            Constants.CompletionState.INCOMPLETE &&
            (plannedTask.completedQuantity ?? 0) >= (plannedTask.quantity ?? 1)
        ) {
            return Constants.CompletionState.COMPLETE;
        }

        return plannedTask.status ?? Constants.CompletionState.INCOMPLETE;
    }

    private static async getIdByUniqueData(
        plannedDayId?: number,
        scheduledHabitId?: number,
        timeOfDayId?: number
    ) {
        if (!plannedDayId || !scheduledHabitId || !timeOfDayId) {
            return undefined;
        }

        const plannedHabit = await PlannedHabitDao.getByPlannedDayAndScheduledHabitAndTimeOfDay(
            plannedDayId,
            scheduledHabitId,
            timeOfDayId
        );

        return plannedHabit?.id;
    }
}
