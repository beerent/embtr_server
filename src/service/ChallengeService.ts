import { GENERAL_FAILURE, SUCCESS } from '@src/common/RequestResponses';
import { ChallengeController } from '@src/controller/ChallengeController';
import {
    GetChallengeResponse,
    GetChallengesResponse,
} from '@resources/types/requests/ChallengeTypes';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Challenge, ChallengeCalculationType, ChallengeRequirement } from '@resources/schema';
import { Response } from '@resources/types/requests/RequestTypes';
import { Request } from 'express';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { PlannedTaskController } from '@src/controller/PlannedTaskController';
import { UnitController } from '@src/controller/UnitController';

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
                requirement.custom = {
                    percentComplete: await ChallengeService.getUserChallengeProgressPercent(
                        userId,
                        requirement,
                        challenge.start ?? new Date(),
                        challenge.end ?? new Date()
                    ),
                };
            })
        );
    }

    private static async getUserChallengeProgressPercent(
        userId: number,
        requirement: ChallengeRequirement,
        start: Date,
        end: Date
    ) {
        if (requirement.calculationType === ChallengeCalculationType.TOTAL) {
            // get all tasks that match the ID of the task that fall between the start and end date-
            const quantitySum = await PlannedTaskController.getSumOfQuantityForTaskBetweenDates(
                userId,
                requirement.taskId ?? 0,
                start,
                end
            );

            const percentComplete = quantitySum ?? 0 / (requirement.requiredTaskQuantity ?? 1);
            return percentComplete;

            // divide by the total quantity
        } else if (requirement.calculationType === ChallengeCalculationType.UNIQUE) {
        }

        return 0;
    }
}
