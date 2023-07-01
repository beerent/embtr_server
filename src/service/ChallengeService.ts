import {
    Challenge,
    ChallengeCalculationType,
    ChallengeCompletionData,
    ChallengeRequirement,
} from '@resources/schema';
import {
    GetChallengeResponse,
    GetChallengesResponse,
} from '@resources/types/requests/ChallengeTypes';
import { Response } from '@resources/types/requests/RequestTypes';
import { GENERAL_FAILURE, SUCCESS } from '@src/common/RequestResponses';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { ChallengeController } from '@src/controller/ChallengeController';
import {
    ChallengeRequirementResults,
    PlannedTaskController,
} from '@src/controller/PlannedTaskController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Request } from 'express';

export class ChallengeService {
    public static async getAll(request: Request): Promise<GetChallengesResponse> {
        const userId: number = (await AuthorizationController.getUserIdFromToken(
            request.headers.authorization!
        )) as number;

        const challenges = await ChallengeController.getAll();
        const challengeModels: Challenge[] = ModelConverter.convertAll(challenges);
        await ChallengeService.postProcessChallengeModels(challengeModels, userId);

        return { ...SUCCESS, challenges: challengeModels };
    }

    public static async getAllForUser(userId: number): Promise<GetChallengesResponse> {
        const challenges = await ChallengeController.getAllForUser(userId);
        const challengeModels: Challenge[] = ModelConverter.convertAll(challenges);
        await ChallengeService.postProcessChallengeModels(challengeModels, userId);

        return { ...SUCCESS, challenges: challengeModels };
    }

    public static async get(request: Request): Promise<GetChallengeResponse> {
        const userId: number = (await AuthorizationController.getUserIdFromToken(
            request.headers.authorization!
        )) as number;

        const id = Number(request.params.id);

        const challenge = await ChallengeController.get(id);
        if (!challenge) {
            return { ...GENERAL_FAILURE, message: 'challenge not found' };
        }

        const challengeModel: Challenge = ModelConverter.convert(challenge);
        await ChallengeService.postProcessChallengeModel(challengeModel, userId);

        return { ...SUCCESS, challenge: challengeModel };
    }

    public static async register(request: Request): Promise<Response> {
        const userId: number = (await AuthorizationController.getUserIdFromToken(
            request.headers.authorization!
        )) as number;

        if (!userId) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const challengeId = Number(request.params.id);

        const challenge = await ChallengeController.get(challengeId);
        if (challenge?.challengeParticipants.some((participant) => participant.userId === userId)) {
            return { ...GENERAL_FAILURE, message: 'user already registered for challenge' };
        }

        const response = await ChallengeController.register(userId, challengeId);
        return SUCCESS;
    }

    private static async postProcessChallengeModels(challenges: Challenge[], userId: number) {
        await Promise.all(
            challenges.map((challenge) =>
                ChallengeService.postProcessChallengeModel(challenge, userId)
            )
        );
    }

    private static async postProcessChallengeModel(challenge: Challenge, userId: number) {
        await Promise.all(
            (challenge.challengeRequirements ?? []).map(async (requirement) => {
                const completionData: ChallengeCompletionData =
                    await ChallengeService.getCompletionData(userId, challenge, requirement);

                requirement.custom = {
                    completionData,
                };
            })
        );
    }

    public static async getCompletionData(
        userId: number,
        challenge: Challenge,
        requirement: ChallengeRequirement
    ) {
        const start = challenge.start ?? new Date();
        const end = challenge.end ?? new Date();
        const daysInDateRange = Math.floor(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );
        const interval = requirement.calculationIntervalDays ?? daysInDateRange;

        const results: ChallengeRequirementResults[] =
            await PlannedTaskController.getChallengeRequirementProgess(
                userId,
                requirement.taskId ?? 0,
                start,
                end,
                interval
            );

        let amountComplete = 0;
        let amountRequired = 0;
        let percentComplete = 0;

        if (requirement.calculationType === ChallengeCalculationType.TOTAL) {
            const result: ChallengeRequirementResults = results[0];

            amountComplete = result?.totalCompleted ?? 0;
            amountRequired = requirement.requiredTaskQuantity ?? 1;
            percentComplete = Math.floor((amountComplete / amountRequired) * 100);
        } else if (requirement.calculationType === ChallengeCalculationType.UNIQUE) {
            amountComplete = results.filter(
                (result) => result.totalCompleted >= requirement.requiredTaskQuantity!
            ).length;
            amountRequired = requirement.requiredIntervalQuantity ?? 1;
            percentComplete = Math.floor((amountComplete / amountRequired) * 100);
        }

        return {
            amountComplete,
            amountRequired,
            percentComplete,
        };
    }
}
