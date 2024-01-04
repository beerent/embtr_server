import { PlannedDayResult as PlannedDayResultModel } from '@resources/schema';
import {
    CreatePlannedDayResultRequest,
    GetPlannedDayResultRequest,
    GetPlannedDayResultResponse,
    GetPlannedDayResultSummariesResponse,
    GetPlannedDayResultSummaryResponse,
    GetPlannedDayResultsResponse,
    UpdatePlannedDayResultRequest,
    UpdatePlannedDayResultResponse,
} from '@resources/types/requests/PlannedDayResultTypes';
import {
    CREATE_DAY_RESULT_FAILED,
    GET_DAY_RESULT_UNKNOWN,
    RESOURCE_NOT_FOUND,
    SUCCESS,
    UPDATE_PLANNED_DAY_RESULT_INVALID,
    UPDATE_PLANNED_DAY_RESULT_UNKNOWN,
} from '@src/common/RequestResponses';
import { Request } from 'express';
import { PlannedDayResult } from '@prisma/client';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Response } from '@resources/types/requests/RequestTypes';
import {
    CompletedHabit,
    CompletedHabitElement,
    PlannedDayResultSummary,
} from '@resources/types/planned_day_result/PlannedDayResult';
import { AuthorizationDao } from '@src/database/AuthorizationDao';
import { PlannedDayDao } from '@src/database/PlannedDayDao';
import { PlannedDayResultDao, PlannedDayResultType } from '@src/database/PlannedDayResultDao';
import { UserDao } from '@src/database/UserDao';

export class PlannedDayResultService {
    public static async create(request: Request): Promise<GetPlannedDayResultResponse> {
        const body: CreatePlannedDayResultRequest = {
            plannedDayId: request.body.plannedDayId,
        };

        const userId: number = (await AuthorizationDao.getUserIdFromToken(
            request.headers.authorization!
        )) as number;

        if (!userId) {
            return CREATE_DAY_RESULT_FAILED;
        }

        const plannedDay = await PlannedDayDao.get(body.plannedDayId);
        if (!plannedDay) {
            return CREATE_DAY_RESULT_FAILED;
        }

        if (plannedDay.user.id !== userId) {
            return CREATE_DAY_RESULT_FAILED;
        }

        const createdPlannedDayResult: PlannedDayResult = await PlannedDayResultDao.create(
            body.plannedDayId,
            this.getRandomSuccessMessage()
        );

        if (createdPlannedDayResult) {
            const convertedDayResult: PlannedDayResultModel =
                ModelConverter.convert(createdPlannedDayResult);
            return { ...SUCCESS, plannedDayResult: convertedDayResult };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }

    public static async update(request: Request): Promise<UpdatePlannedDayResultResponse> {
        const updateRequest: UpdatePlannedDayResultRequest = request.body;

        const userId: number = (await AuthorizationDao.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        if (!userId) {
            return UPDATE_PLANNED_DAY_RESULT_INVALID;
        }

        const plannedDayResult = await PlannedDayResultDao.getById(
            updateRequest.plannedDayResult!.id!
        );
        if (!plannedDayResult) {
            return UPDATE_PLANNED_DAY_RESULT_UNKNOWN;
        }

        if (plannedDayResult.plannedDay.user.id !== userId) {
            return UPDATE_PLANNED_DAY_RESULT_UNKNOWN;
        }

        const updatedPlannedDayResult = await PlannedDayResultDao.update(
            updateRequest.plannedDayResult!
        );
        if (updatedPlannedDayResult) {
            const updatedPlannedDayResultModel: PlannedDayResultModel =
                ModelConverter.convert(updatedPlannedDayResult);
            return { ...SUCCESS, plannedDayResult: updatedPlannedDayResultModel };
        }

        return UPDATE_PLANNED_DAY_RESULT_INVALID;
    }

    public static async getAllForUser(userId: number): Promise<GetPlannedDayResultsResponse> {
        const user = await UserDao.getById(userId);
        if (!user) {
            return { ...RESOURCE_NOT_FOUND, message: 'user not found' };
        }

        const dayResults = await PlannedDayResultDao.getAllForUser(userId);

        if (dayResults) {
            const convertedDayResults: PlannedDayResultModel[] =
                ModelConverter.convertAll(dayResults);
            return { ...SUCCESS, plannedDayResults: convertedDayResults };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }

    public static async getAll(request: Request): Promise<GetPlannedDayResultsResponse> {
        let upperBound = new Date();
        if (request.query.upperBound) {
            upperBound = new Date(request.query.upperBound as string);
        }

        let lowerBound = new Date(new Date().setMonth(new Date().getMonth() - 300));
        if (request.query.lowerBound) {
            lowerBound = new Date(request.query.lowerBound as string);
        }

        const dayResults = await PlannedDayResultDao.getAll(upperBound, lowerBound);

        if (dayResults) {
            const convertedDayResults: PlannedDayResultModel[] =
                ModelConverter.convertAll(dayResults);
            return { ...SUCCESS, plannedDayResults: convertedDayResults };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }

    public static async getAllByIds(ids: number[]): Promise<GetPlannedDayResultsResponse> {
        if (ids.length === 0) {
            return { ...SUCCESS, plannedDayResults: [] };
        }

        const dayResults = await PlannedDayResultDao.getAllByIds(ids);

        if (dayResults) {
            const convertedDayResults: PlannedDayResultModel[] =
                ModelConverter.convertAll(dayResults);
            return { ...SUCCESS, plannedDayResults: convertedDayResults };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }

    public static async getAllSummaries(
        request: Request
    ): Promise<GetPlannedDayResultSummariesResponse> {
        let upperBound = new Date();
        if (request.query.upperBound) {
            upperBound = new Date(request.query.upperBound as string);
        }

        let lowerBound = new Date(new Date().setMonth(new Date().getMonth() - 300));
        if (request.query.lowerBound) {
            lowerBound = new Date(request.query.lowerBound as string);
        }

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

        return { ...SUCCESS, plannedDayResultSummaries: summaries };
    }

    public static async getAllSummariesForUser(
        userId: number
    ): Promise<GetPlannedDayResultSummariesResponse> {
        const dayResults = await PlannedDayResultDao.getAllForUser(userId);

        const summaries: PlannedDayResultSummary[] = [];
        for (const dayResult of dayResults) {
            const completedHabits: CompletedHabit[] = this.getCompletedHabits(dayResult);
            const summary: PlannedDayResultSummary = {
                plannedDayResult: ModelConverter.convert(dayResult),
                completedHabits,
            };
            summaries.push(summary);
        }

        return { ...SUCCESS, plannedDayResultSummaries: summaries };
    }

    public static async getSummaryById(id: number): Promise<GetPlannedDayResultSummaryResponse> {
        const dayResult = await PlannedDayResultDao.getById(id);

        if (dayResult) {
            const completedHabits: CompletedHabit[] = this.getCompletedHabits(dayResult);
            const summary: PlannedDayResultSummary = {
                plannedDayResult: ModelConverter.convert(dayResult),
                completedHabits,
            };

            return { ...SUCCESS, plannedDayResultSummary: summary };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }

    public static async getById(id: number): Promise<GetPlannedDayResultResponse> {
        const dayResult = await PlannedDayResultDao.getById(id);

        if (dayResult) {
            const convertedDayResult: PlannedDayResultModel = ModelConverter.convert(dayResult);
            return { ...SUCCESS, plannedDayResult: convertedDayResult };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }

    public static async getByUserAndDayKey(
        request: GetPlannedDayResultRequest
    ): Promise<GetPlannedDayResultResponse> {
        const dayResult = await PlannedDayResultDao.getByUserAndDayKey(
            request.userId,
            request.dayKey
        );

        if (dayResult) {
            const convertedDayResult: PlannedDayResultModel = ModelConverter.convert(dayResult);
            return { ...SUCCESS, plannedDayResult: convertedDayResult };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }

    public static async hideRecommendation(request: Request): Promise<Response> {
        const userId: number = (await AuthorizationDao.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        if (!userId) {
            return { ...UPDATE_PLANNED_DAY_RESULT_INVALID, message: 'invalid user' };
        }

        const dayKey = request.params.dayKey;
        const plannedDay = await PlannedDayDao.getByUserAndDayKey(userId, dayKey);
        if (!plannedDay) {
            return { ...UPDATE_PLANNED_DAY_RESULT_INVALID, message: 'invalid day' };
        }

        return SUCCESS;
    }

    private static getCompletedHabits(plannedDayResult: PlannedDayResultType): CompletedHabit[] {
        if (!plannedDayResult?.plannedDay) {
            return [];
        }

        const completedHabits: CompletedHabit[] = [];
        plannedDayResult.plannedDay.plannedTasks.forEach((plannedTask) => {
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
                    localImage: plannedTask.localImage ?? undefined,
                    remoteImageUrl: plannedTask.remoteImageUrl ?? undefined,
                    attempted: 1,
                    completed: completed ? 1 : 0,
                    elements: [element],
                });
            }
        });

        return completedHabits;
    }

    private static getRandomSuccessMessage(): string {
        const variations = [
            'Day conquered! Congrats!',
            'Tasks nailed! Bravo!',
            'Success! Well done!',
            'All done! Congrats!',
            'Daily goals crushed!',
            'You did it! Kudos!',
            'Productive day! Congrats!',
            'Champion of the day!',
            'Taskmaster! Congrats!',
            'Victory achieved!',
            'Goal slayer! Congrats!',
            'Great job today!',
            "Day's triumph! Congrats!",
            'Mission complete!',
            'Tasks tackled! Bravo!',
            'Awesome work! Congrats!',
            'Winning day! Well done!',
            'Efficiency unlocked!',
            'Task wizard! Congrats!',
            'Daily success! Bravo!',
        ];

        return variations[Math.floor(Math.random() * variations.length)];
    }
}
