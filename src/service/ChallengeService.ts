import { GENERAL_FAILURE, SUCCESS } from '@src/common/RequestResponses';
import { ChallengeController } from '@src/controller/ChallengeController';
import {
    GetChallengeResponse,
    GetChallengesResponse,
} from '@resources/types/requests/ChallengeTypes';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Challenge } from '@resources/schema';
import { Response } from '@resources/types/requests/RequestTypes';
import { Request } from 'express';
import { AuthorizationController } from '@src/controller/AuthorizationController';

export class ChallengeService {
    public static async getAll(): Promise<GetChallengesResponse> {
        const challenges = await ChallengeController.getAll();
        const challengeModels: Challenge[] = ModelConverter.convertAll(challenges);

        return { ...SUCCESS, challenges: challengeModels };
    }

    public static async getAllForUser(userId: number): Promise<GetChallengesResponse> {
        const challenges = await ChallengeController.getAllForUser(userId);
        const challengeModels: Challenge[] = ModelConverter.convertAll(challenges);

        return { ...SUCCESS, challenges: challengeModels };
    }

    public static async get(id: number): Promise<GetChallengeResponse> {
        const challenge = await ChallengeController.get(id);
        if (!challenge) {
            return { ...GENERAL_FAILURE, message: 'challenge not found' };
        }

        const challengeModel: Challenge = ModelConverter.convert(challenge);
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
}
