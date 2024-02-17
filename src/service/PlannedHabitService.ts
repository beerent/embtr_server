import { PlannedTask } from '@resources/schema';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Constants } from '@resources/types/constants/constants';
import { PlannedDayDao } from '@src/database/PlannedDayDao';
import { PlannedHabitDao } from '@src/database/PlannedHabitDao';
import { ServiceException } from '@src/general/exception/ServiceException';
import { Code } from '@resources/codes';
import { Context } from '@src/general/auth/Context';

export class PlannedHabitService {
    public static async getById(context: Context, id: number): Promise<PlannedTask> {
        const plannedHabit = await PlannedHabitDao.get(id);
        if (!plannedHabit) {
            throw new ServiceException(404, Code.PLANNED_TASK_NOT_FOUND, 'planned habit not found');
        }

        const plannedHabitModel: PlannedTask = ModelConverter.convert(plannedHabit);
        return plannedHabitModel;
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
        const plannedDay = await PlannedDayDao.getByUserAndDayKey(context.userId, dayKey);
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

        const updatedPlannedTask = await PlannedHabitDao.update(plannedTask);
        if (!updatedPlannedTask) {
            throw new ServiceException(
                500,
                Code.PLANNED_TASK_NOT_FOUND,
                'failed to update planned task'
            );
        }

        const updatedPlannedTaskModel: PlannedTask = ModelConverter.convert(updatedPlannedTask);
        // const completedChallenges =
        //     await ChallengeService.updateChallengeRequirementProgress(updatedPlannedTaskModel);

        return updatedPlannedTaskModel;
    }

    private static getUpdatedStatus(plannedTask: PlannedTask): string {
        if (
            (plannedTask.status ?? Constants.HabitStatus.INCOMPLETE) ===
            Constants.HabitStatus.INCOMPLETE &&
            (plannedTask.completedQuantity ?? 0) >= (plannedTask.quantity ?? 1)
        ) {
            return Constants.HabitStatus.COMPLETE;
        }

        return plannedTask.status ?? Constants.HabitStatus.INCOMPLETE;
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
