import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import {
    CompletedHabit,
    CompletedHabitElement,
    PlannedDayResultSummary,
} from '@resources/types/planned_day_result/PlannedDayResult';
import { PlannedDayDao } from '@src/database/PlannedDayDao';
import { PlannedDayResultDao, PlannedDayResultType } from '@src/database/PlannedDayResultDao';
import { Context, UserContext } from '@src/general/auth/Context';
import { ServiceException } from '@src/general/exception/ServiceException';
import { Code } from '@resources/codes';
import { PlannedDayResult, PlannedTask } from '@resources/schema';
import { ImageDetectionService } from './ImageService';
import { ImageDao } from '@src/database/ImageDao';
import { BlockUserService } from './BlockUserService';
import { PlannedDayAttribute, PlannedDayResultDto } from '@resources/types/dto/PlannedDay';
import { DeprecatedImageUtility } from '@src/utility/DeprecatedImageUtility';
import { PlannedDayResultEventDispatcher } from '@src/event/planned_day_result/PlannedDayResultEventDispatcher';
import { ContextService } from './ContextService';

export class PlannedDayResultService {
    public static async create(
        context: Context,
        plannedDayResult: PlannedDayResult
    ): Promise<PlannedDayResult> {
        const plannedDay = await PlannedDayDao.get(plannedDayResult.plannedDayId ?? 0);
        if (!plannedDay?.dayKey) {
            throw new ServiceException(404, Code.PLANNED_DAY_NOT_FOUND, 'planned day not found');
        }

        if (plannedDay.userId !== context.userId) {
            throw new ServiceException(404, Code.FORBIDDEN, 'planned day does not belong to user');
        }

        const createdPlannedDayResult = await PlannedDayResultDao.create(
            plannedDayResult.plannedDayId ?? 0,
            plannedDayResult.description ?? '',
            plannedDayResult.images ?? []
        );

        if (!createdPlannedDayResult) {
            throw new ServiceException(
                500,
                Code.PLANNED_DAY_RESULT_NOT_CREATED,
                'planned day result not created'
            );
        }

        const userContext = ContextService.contextToUserContext(context);
        PlannedDayResultEventDispatcher.onCreated(
            userContext,
            createdPlannedDayResult.id,
            plannedDay.dayKey
        );

        const plannedDayResultModel: PlannedDayResult =
            ModelConverter.convert(createdPlannedDayResult);
        return plannedDayResultModel;
    }

    public static async update(
        context: Context,
        plannedDayResult: PlannedDayResult
    ): Promise<PlannedDayResult> {
        if (!plannedDayResult.id) {
            throw new ServiceException(400, Code.INVALID_REQUEST, 'invalid request');
        }

        const databasePlannedDayResult = await PlannedDayResultDao.getById(plannedDayResult.id);
        if (!databasePlannedDayResult) {
            throw new ServiceException(
                404,
                Code.PLANNED_DAY_RESULT_NOT_FOUND,
                'planned day result does not exist'
            );
        }

        if (databasePlannedDayResult.plannedDay.userId !== context.userId) {
            throw new ServiceException(
                404,
                Code.FORBIDDEN,
                'planned day result does not belong to user'
            );
        }

        const filteredImageResults = await ImageDetectionService.filterImages(
            plannedDayResult.images ?? []
        );
        plannedDayResult.images = filteredImageResults.clean;
        await ImageDao.deleteImages(filteredImageResults.adult);

        const updatedPlannedDayResult = await PlannedDayResultDao.update(plannedDayResult);

        if (!updatedPlannedDayResult.active && plannedDayResult.plannedDay?.dayKey) {
            const userContext = ContextService.contextToUserContext(context);
            PlannedDayResultEventDispatcher.onDeleted(
                userContext,
                plannedDayResult.id ?? 1,
                plannedDayResult.plannedDay.dayKey
            );
        }

        if (!updatedPlannedDayResult) {
            throw new ServiceException(
                500,
                Code.PLANNED_DAY_RESULT_NOT_FOUND,
                'failed to update planned day result'
            );
        }

        const plannedDayResultModel: PlannedDayResult =
            ModelConverter.convert(updatedPlannedDayResult);
        return plannedDayResultModel;
    }

    public static async getAll(
        context: Context,
        lowerBound: Date,
        upperBound: Date
    ): Promise<PlannedDayResult[]> {
        const plannedDayResults = await PlannedDayResultDao.getAll(lowerBound, upperBound);
        if (!plannedDayResults) {
            throw new ServiceException(
                404,
                Code.PLANNED_DAY_RESULT_NOT_FOUND,
                'planned day results not found'
            );
        }

        const plannedDayResultModels: PlannedDayResult[] =
            ModelConverter.convertAll(plannedDayResults);
        return plannedDayResultModels;
    }

    public static async getAllByIds(context: Context, ids: number[]): Promise<PlannedDayResult[]> {
        if (ids.length === 0) {
            return [];
        }

        const plannedDayResults = await PlannedDayResultDao.getAllByIds(ids);

        if (!plannedDayResults) {
            throw new ServiceException(
                404,
                Code.PLANNED_DAY_RESULT_NOT_FOUND,
                'planned day results not found'
            );
        }

        const plannedDayResultsModels: PlannedDayResult[] =
            ModelConverter.convertAll(plannedDayResults);
        plannedDayResultsModels.forEach((plannedDayResult) => {
            plannedDayResult.plannedDay?.plannedTasks?.forEach((plannedTask) => {
                DeprecatedImageUtility.setPlannedTaskImages(plannedTask);
            });
        });
        const plannedDayResultDtos: PlannedDayResultDto[] = plannedDayResultsModels;
        this.addAttributes(plannedDayResultDtos);
        return plannedDayResultDtos;
    }

    public static async getAllSummaries(
        context: Context,
        lowerBound: Date,
        upperBound: Date
    ): Promise<PlannedDayResultSummary[]> {
        const dayResults = await PlannedDayResultDao.getAll(upperBound, lowerBound);

        const summaries: PlannedDayResultSummary[] = [];
        for (const dayResult of dayResults) {
            const completedHabits: CompletedHabit[] = this.getCompletedHabits(dayResult);
            const summary: PlannedDayResultSummary = {
                plannedDayResult: ModelConverter.convert(dayResult),
                completedHabits,
            };
            summaries.push(summary);
        }

        return summaries;
    }

    public static async getAllSummariesForUser(
        context: Context,
        userId: number
    ): Promise<PlannedDayResultSummary[]> {
        const plannedDayResults = await PlannedDayResultDao.getAllForUser(userId);

        const plannedDayResultSummaries: PlannedDayResultSummary[] = [];
        for (const plannedDayResult of plannedDayResults) {
            const completedHabits: CompletedHabit[] = this.getCompletedHabits(plannedDayResult);
            const plannedDayResultSummary: PlannedDayResultSummary = {
                plannedDayResult: ModelConverter.convert(plannedDayResult),
                completedHabits,
            };
            plannedDayResultSummaries.push(plannedDayResultSummary);
        }

        return plannedDayResultSummaries;
    }

    public static async getSummaryById(
        context: Context,
        id: number
    ): Promise<PlannedDayResultSummary> {
        const plannedDayResult = await PlannedDayResultDao.getById(id);

        if (!plannedDayResult) {
            throw new ServiceException(
                404,
                Code.PLANNED_DAY_RESULT_NOT_FOUND,
                'planned day result not found'
            );
        }

        const completedHabits: CompletedHabit[] = this.getCompletedHabits(plannedDayResult);
        const summary: PlannedDayResultSummary = {
            plannedDayResult: ModelConverter.convert(plannedDayResult),
            completedHabits,
        };

        return summary;
    }

    public static async getById(context: Context, id: number): Promise<PlannedDayResultDto> {
        const plannedDayResult = await PlannedDayResultDao.getById(id);

        if (!plannedDayResult) {
            throw new ServiceException(
                404,
                Code.PLANNED_DAY_RESULT_NOT_FOUND,
                'planned day result not found'
            );
        }

        const blockedUserIds = await BlockUserService.getBlockedAndBlockedByUserIds(context);
        plannedDayResult.comments = plannedDayResult.comments.filter(
            (comment) => !blockedUserIds.includes(comment.userId)
        );

        const plannedDayResultModel: PlannedDayResult = ModelConverter.convert(plannedDayResult);
        plannedDayResultModel.plannedDay?.plannedTasks?.forEach((plannedTask) => {
            DeprecatedImageUtility.setPlannedTaskImages(plannedTask);
        });
        const plannedDayResultDto: PlannedDayResultDto = plannedDayResultModel;
        this.addAttribute(plannedDayResultDto);

        return plannedDayResultModel;
    }

    public static async existsByDayKey(context: UserContext, dayKey: string): Promise<boolean> {
        const exists = await PlannedDayResultDao.exists(context.userId, dayKey);
        return exists;
    }

    public static async getByUserAndDayKey(
        context: Context,
        userId: number,
        dayKey: string
    ): Promise<PlannedDayResult> {
        const plannedDayResult = await PlannedDayResultDao.getByUserAndDayKey(userId, dayKey);
        if (!plannedDayResult?.active) {
            throw new ServiceException(
                404,
                Code.PLANNED_DAY_RESULT_NOT_FOUND,
                'planned day result not found'
            );
        }

        const plannedDayResultModel: PlannedDayResult = ModelConverter.convert(plannedDayResult);
        return plannedDayResultModel;
    }

    public static async count(context: Context): Promise<number> {
        return await PlannedDayResultDao.count(context.userId);
    }

    private static addAttributes(plannedDayResultDtos: PlannedDayResultDto[]): void {
        plannedDayResultDtos.forEach((plannedDayResultDto) => {
            this.addAttribute(plannedDayResultDto);
        });
    }

    private static addAttribute(plannedDayResultDto: PlannedDayResultDto): void {
        const plannedDayAttribute = this.getPlannedDayAttribute(plannedDayResultDto);
        if (plannedDayAttribute) {
            plannedDayResultDto.attribute = plannedDayAttribute;
        }
    }

    private static getPlannedDayAttribute(
        plannedDayResultDto: PlannedDayResultDto
    ): PlannedDayAttribute | undefined {
        const milestones = plannedDayResultDto.plannedDay?.plannedDayChallengeMilestones;
        if (milestones?.length == 0) {
            return undefined;
        }

        milestones?.sort(
            (a, b) =>
                (b.challengeMilestone?.milestone?.ordinal ?? 0) -
                (a.challengeMilestone?.milestone?.ordinal ?? 0)
        );

        const firstMilestone = milestones?.[0];

        let description = firstMilestone?.challengeMilestone?.milestone?.description ?? '';
        description = description.replace(
            '_USERNAME_',
            plannedDayResultDto.plannedDay?.user?.username ?? ''
        );
        description = description.replace(
            '_CHALLENGE_',
            firstMilestone?.challengeMilestone?.challenge?.name ?? ''
        );

        const firstRequirement =
            firstMilestone?.challengeMilestone?.challenge?.challengeRequirements?.[0];

        const attribute: PlannedDayAttribute = {
            body: description,
            icon: firstRequirement?.task?.icon,
            ionicon: {
                name: 'flash',
                color: '#FF6712',
            },
        };

        return attribute;
    }

    private static getCompletedHabits(plannedDayResult: PlannedDayResultType): CompletedHabit[] {
        if (!plannedDayResult?.plannedDay) {
            return [];
        }

        const completedHabits: CompletedHabit[] = [];
        plannedDayResult.plannedDay.plannedTasks.forEach((plannedTaskDb) => {
            const plannedTask: PlannedTask = ModelConverter.convert(plannedTaskDb);
            DeprecatedImageUtility.setPlannedTaskImages(plannedTask);

            const element: CompletedHabitElement = {
                unit: plannedTask.unit ?? undefined,
                quantity: plannedTask.quantity ?? 0,
                completedQuantity: plannedTask.completedQuantity ?? 0,
            };

            const completed = (plannedTask.completedQuantity ?? 0) >= (plannedTask.quantity ?? 0);

            if (
                completedHabits.some(
                    (habit) => habit.scheduledHabitId === plannedTask.scheduledHabitId
                )
            ) {
                const habit = completedHabits.find(
                    (habit) => habit.scheduledHabitId === plannedTask.scheduledHabitId
                )!;
                habit.attempted += 1;
                habit.completed += completed ? 1 : 0;

                const elementIndex = habit.elements.findIndex(
                    (element) => element.unit === element.unit
                );
                if (elementIndex !== -1) {
                    habit.elements[elementIndex].quantity += element.quantity;
                    habit.elements[elementIndex].completedQuantity += element.completedQuantity;
                } else {
                    habit.elements.push(element);
                }
            } else {
                completedHabits.push({
                    scheduledHabitId: plannedTask.scheduledHabitId ?? 0,
                    remoteImageUrl: plannedTask.remoteImageUrl ?? '',
                    localImage: plannedTask.localImage ?? '',
                    attempted: 1,
                    completed: completed ? 1 : 0,
                    elements: [element],
                });
            }
        });

        return completedHabits;
    }
}
