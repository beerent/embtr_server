import express from 'express';
import { GetChallengeParticipationResponse } from '@resources/types/requests/ChallengeTypes';
import { authenticate } from '@src/middleware/authentication';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { validateGetUserData } from '@src/middleware/user_post/UserPostValidation';
import { ChallengeService } from '@src/service/ChallengeService';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { SUCCESS } from '@src/common/RequestResponses';
import { ChallengeParticipantTransformationServiceV3 } from '@src/transform/ChallengeParticipantTransformationService';
import { ContextService } from '@src/service/ContextService';

const userRouterV3 = express.Router();
const v = 'v3';

/**
 * @deprecated on version 3.0.0 (use version 4.0.0)
 */
userRouterV3.get(
    '/:userId/active-challenge-participation',
    routeLogger(v),
    authenticate,
    authorize,
    validateGetUserData,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);

        const userId = Number(req.params.userId);
        const challengeParticipation =
            await ChallengeService.getActiveChallengeParticipationForUser(context, userId);
        const transformedChallengeParticipation =
            ChallengeParticipantTransformationServiceV3.transformOutAll(challengeParticipation);

        const response: GetChallengeParticipationResponse = {
            ...SUCCESS,
            challengeParticipation: transformedChallengeParticipation,
        };
        res.status(response.httpCode).json(response);
    })
);

export default userRouterV3;
