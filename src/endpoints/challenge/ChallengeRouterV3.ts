import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { ChallengeService } from '@src/service/ChallengeService';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { ContextService } from '@src/service/ContextService';
import { SUCCESS } from '@src/common/RequestResponses';
import { ChallengeTransformationServiceV3 } from '@src/transform/ChallengeTransformationService';
import { Award, ChallengeDetails, ChallengeSummary } from '@resources/types/dto/Challenge';
import { Response } from '@resources/types/requests/RequestTypes';

export namespace ChallengeTypesV3 {
    export interface GetChallengesSummariesV3Response extends Response {
        challengesSummaries?: ChallengeSummaryV3[];
    }

    export interface GetChallengeSummaryV3Response extends Response {
        challengeSummary?: ChallengeSummaryV3;
    }

    export interface GetChallengesDetailsV3Response extends Response {
        challengesDetails?: ChallengeDetailsV3[];
    }

    export interface GetChallengeDetailsV3Response extends Response {
        challengeDetails?: ChallengeDetailsV3;
    }

    export interface GetChallengesRecentlyJoinedV3Response extends Response {
        challengesRecentlyJoined?: ChallengeRecentlyJoinedV3[];
    }

    export interface ChallengeChallengeRewardV3 extends Award { }

    export interface ChallengeRecentlyJoinedV3 extends ChallengeSummaryV3 { }

    export interface ChallengeSummaryV3 extends ChallengeSummary {
        challengeRewards: ChallengeChallengeRewardV3[];
    }

    export interface ChallengeDetailsV3 extends ChallengeDetails {
        challengeRewards: ChallengeChallengeRewardV3[];
    }
}

const challengeRouterV3 = express.Router();
const v = 'v3';

challengeRouterV3.get('/summary', routeLogger(v), authenticate, authorize, async (req, res) => {
    const context = await ContextService.get(req);

    const challengeSummaries = await ChallengeService.getAllSummaries(context);
    const transformedChallengeSummaries =
        ChallengeTransformationServiceV3.transformOutAllChallengeSummaries(challengeSummaries);
    const response: ChallengeTypesV3.GetChallengesSummariesV3Response = {
        ...SUCCESS,
        challengesSummaries: transformedChallengeSummaries,
    };

    res.status(response.httpCode).json(response);
});

challengeRouterV3.get('/:id/summary', routeLogger(v), authenticate, authorize, async (req, res) => {
    const context = await ContextService.get(req);
    const id = Number(req.params.id);

    const challengeSummary = await ChallengeService.getSummary(context, id);
    const transformedchallengeSummary =
        ChallengeTransformationServiceV3.transformOutChallengeSummary(challengeSummary);

    const response: ChallengeTypesV3.GetChallengeSummaryV3Response = {
        ...SUCCESS,
        challengeSummary: transformedchallengeSummary,
    };

    res.status(response.httpCode).json(response);
});

challengeRouterV3.get('/details', routeLogger(v), authenticate, authorize, async (req, res) => {
    const context = await ContextService.get(req);

    const challengesDetails = await ChallengeService.getAllDetails(context);
    const transformedChallengesDetails =
        ChallengeTransformationServiceV3.transformOutAllChallengeDetails(challengesDetails);

    const response: ChallengeTypesV3.GetChallengesDetailsV3Response = {
        ...SUCCESS,
        challengesDetails: transformedChallengesDetails,
    };
    res.status(response.httpCode).json(response);
});

challengeRouterV3.get('/:id/details', routeLogger(v), authenticate, authorize, async (req, res) => {
    const context = await ContextService.get(req);
    const id = Number(req.params.id);

    const challengeDetails = await ChallengeService.getDetails(context, id);
    const transformedChallengeDetails =
        ChallengeTransformationServiceV3.transformOutChallengeDetails(challengeDetails);
    const response: ChallengeTypesV3.GetChallengeDetailsV3Response = {
        ...SUCCESS,
        challengeDetails: transformedChallengeDetails,
    };
    res.status(response.httpCode).json(response);
});

export default challengeRouterV3;
