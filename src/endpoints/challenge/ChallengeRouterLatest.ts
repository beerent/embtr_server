import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize, authorizeAdmin } from '@src/middleware/general/GeneralAuthorization';
import { ChallengeService } from '@src/service/ChallengeService';
import { validateChallengeRegister } from '@src/middleware/challenge/ChallengeValidation';
import {
    validateCommentDelete,
    validateCommentPost,
    validateLikePost,
} from '@src/middleware/general/GeneralValidation';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { LikeService } from '@src/service/LikeService';
import { Constants } from '@resources/types/constants/constants';
import { CommentService } from '@src/service/CommentService';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { ContextService } from '@src/service/ContextService';
import { Context } from '@src/general/auth/Context';
import { CreateLikeResponse } from '@resources/types/requests/GeneralTypes';
import { SUCCESS } from '@src/common/RequestResponses';
import {
    CreateChallengeResponse,
    GetChallengeDetailsResponse,
    GetChallengesDetailsResponse,
    GetChallengesSummariesResponse,
    GetChallengeSummaryResponse,
    GetChallengesResponse,
    GetChallengeFullResponse,
    CreateChallengeFullRequest,
    UpdateChallengeFullRequest,
} from '@resources/types/requests/ChallengeTypes';
import { ChallengeFullService } from '@src/service/feature/ChallengeFullService';
import { ChallengeController } from '@src/controller/ChallengeController';

// WARNING: Must be a level 12+ Engineer to refactor this file. - TheCaptainCoder - 2024-04-19

const challengeRouterLatest = express.Router();
const v = '✓';

challengeRouterLatest.get('/summary', routeLogger(v), authenticate, authorize, async (req, res) => {
    const context = await ContextService.get(req);

    const challengeSummaries = await ChallengeService.getAllSummaries(context);
    const response: GetChallengesSummariesResponse = {
        ...SUCCESS,
        challengesSummaries: challengeSummaries,
    };
    res.status(response.httpCode).json(response);
});

challengeRouterLatest.get(
    '/:id/summary',
    routeLogger(v),
    authenticate,
    authorize,
    async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);

        const challengeSummary = await ChallengeService.getSummary(context, id);
        const response: GetChallengeSummaryResponse = {
            ...SUCCESS,
            challengeSummary: challengeSummary,
        };
        res.status(response.httpCode).json(response);
    }
);

challengeRouterLatest.get('/details', routeLogger(v), authenticate, authorize, async (req, res) => {
    const context = await ContextService.get(req);

    const challengesDetails = await ChallengeService.getAllDetails(context);
    const response: GetChallengesDetailsResponse = {
        ...SUCCESS,
        challengesDetails: challengesDetails,
    };
    res.status(response.httpCode).json(response);
});

challengeRouterLatest.get(
    '/all',
    routeLogger(v),
    authenticate,
    authorizeAdmin,
    async (req, res) => {
        const context = await ContextService.get(req);

        const challenges = await ChallengeService.getAll(context);
        const response: GetChallengesResponse = {
            ...SUCCESS,
            challenges,
        };
        res.status(response.httpCode).json(response);
    }
);

challengeRouterLatest.get(
    '/:id/details',
    routeLogger(v),
    authenticate,
    authorize,
    async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);

        const challengeDetails = await ChallengeService.getDetails(context, id);
        const response: GetChallengeDetailsResponse = {
            ...SUCCESS,
            challengeDetails: challengeDetails,
        };
        res.status(response.httpCode).json(response);
    }
);

challengeRouterLatest.post(
    '/:id/register',
    routeLogger(v),
    authenticate,
    authorize,
    validateChallengeRegister,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);

        await ChallengeService.register(context, id);
        res.json(SUCCESS);
    })
);

challengeRouterLatest.post(
    '/:id/leave',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);
        const dayKey = context.dayKey;

        await ChallengeService.leave(context, id);
        res.json(SUCCESS);
    })
);

challengeRouterLatest.post(
    '/:id/like',
    routeLogger(v),
    authenticate,
    authorize,
    validateLikePost,
    runEndpoint(async (req, res) => {
        const context: Context = await ContextService.get(req);
        const targetId = Number(req.params.id);
        const interactable = Constants.Interactable.CHALLENGE;

        const like = await LikeService.create(context, interactable, targetId);
        const response: CreateLikeResponse = { ...SUCCESS, like };
        res.status(response.httpCode).json(response);
    })
);

challengeRouterLatest.post(
    '/:id/comment/',
    routeLogger(v),
    authenticate,
    authorize,
    validateCommentPost,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const interactable = Constants.Interactable.CHALLENGE;
        const targetId = Number(req.params.id);
        const comment = req.body.comment;

        const createdComment = await CommentService.create(
            context,
            interactable,
            targetId,
            comment
        );
        const response = { ...SUCCESS, comment: createdComment };
        res.status(response.httpCode).json(response);
    })
);

challengeRouterLatest.delete(
    '/comment/:id',
    routeLogger(v),
    authenticate,
    authorize,
    validateCommentDelete,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);

        await CommentService.delete(context, id);
        res.json(SUCCESS);
    })
);

/******************/
/* CHALLENGE FULL */
/******************/

challengeRouterLatest.get(
    '/:id/full',
    routeLogger(v),
    authenticate,
    authorize,
    async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);

        const challengeFull = await ChallengeController.getFull(context, id);
        const response: GetChallengeFullResponse = {
            ...SUCCESS,
            challengeFull: challengeFull,
        };
        res.status(response.httpCode).json(response);
    }
);

challengeRouterLatest.post(
    '/',
    routeLogger(v),
    authenticate,
    authorizeAdmin,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const request: CreateChallengeFullRequest = req.body;

        const challenge = request.challengeFull.challenge;
        const award = request.challengeFull.award;
        const task = request.challengeFull.task;
        const challengeRequirement = request.challengeFull.challengeRequirement;
        const milestoneKeys = request.challengeFull.milestoneKeys;

        const createdChallenge = await ChallengeFullService.create(
            context,
            challenge,
            award,
            task,
            challengeRequirement,
            milestoneKeys
        );
        const response: CreateChallengeResponse = { ...SUCCESS, challenge: createdChallenge };
        res.status(response.httpCode).json(response);
    })
);

challengeRouterLatest.post(
    '/:id',
    routeLogger(v),
    authenticate,
    authorizeAdmin,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const request: UpdateChallengeFullRequest = req.body;

        const id = Number(req.params.id);
        const challengeFull = request.challengeFull;

        const createdChallenge = await ChallengeFullService.update(context, id, challengeFull);
        const response: CreateChallengeResponse = { ...SUCCESS, challenge: createdChallenge };
        res.status(response.httpCode).json(response);
    })
);

challengeRouterLatest.delete(
    '/:id',
    routeLogger(v),
    authenticate,
    authorizeAdmin,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);

        await ChallengeService.delete(context, id);
        res.json(SUCCESS);
    })
);

export default challengeRouterLatest;
