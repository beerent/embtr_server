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
import { PlannedTaskController } from '@src/controller/PlannedTaskController';
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

        let amountComplete = 0;
        let amountRequired = 0;
        let percentComplete = 0;

        if (requirement.calculationType === ChallengeCalculationType.TOTAL) {
            amountComplete =
                (await PlannedTaskController.getSumOfQuantityForTaskBetweenDates(
                    userId,
                    requirement.taskId ?? 0,
                    start,
                    end
                )) ?? 0;

            amountRequired = requirement.requiredTaskQuantity ?? 0;
            percentComplete = (amountComplete / amountRequired) * 100;

            // divide by the total quantity
        } else if (requirement.calculationType === ChallengeCalculationType.UNIQUE) {
        }

        const completionData: ChallengeCompletionData = {
            amountComplete,
            amountRequired,
            percentComplete,
        };

        return completionData;
    }
}
