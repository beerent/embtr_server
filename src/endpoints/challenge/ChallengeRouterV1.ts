import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { ChallengeService } from '@src/service/ChallengeService';
import { validateChallengeRegister } from '@src/middleware/challenge/ChallengeValidation';
import {
    validateCommentDelete,
    validateCommentPost,
    validateLikePost,
} from '@src/middleware/general/GeneralValidation';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { LikeService } from '@src/service/LikeService';
import { Interactable } from '@resources/types/interactable/Interactable';
import { CommentService } from '@src/service/CommentService';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { ContextService } from '@src/service/ContextService';
import { Context } from '@src/general/auth/Context';
import { CreateLikeResponse } from '@resources/types/requests/GeneralTypes';
import { SUCCESS } from '@src/common/RequestResponses';

const challengeRouterV1 = express.Router();
const v = 'v1';

challengeRouterV1.get('/', routeLogger(v), authenticate, authorize, async (req, res) => {
    const response = await ChallengeService.getAll();
    res.status(response.httpCode).json(response);
});

challengeRouterV1.get(
    '/recently-joined',
    routeLogger(v),
    authenticate,
    authorize,
    async (req, res) => {
        const response = await ChallengeService.getRecentJoins(req);
        res.status(response.httpCode).json(response);
    }
);

challengeRouterV1.get('/:id', routeLogger(v), authenticate, authorize, async (req, res) => {
    const response = await ChallengeService.get(req);
    res.status(response.httpCode).json(response);
});

challengeRouterV1.post(
    '/:id/register',
    routeLogger(v),
    authenticate,
    authorize,
    validateChallengeRegister,
    runEndpoint(async (req, res) => {
        const response = await ChallengeService.register(req);
        res.status(response.httpCode).json(response);
    })
);

challengeRouterV1.post(
    '/:id/like',
    routeLogger(v),
    authenticate,
    authorize,
    validateLikePost,
    runEndpoint(async (req, res) => {
        const context: Context = await ContextService.get(req);
        const targetId = Number(req.params.id);
        const interactable = Interactable.CHALLENGE;

        const like = await LikeService.create(context, interactable, targetId);
        const response: CreateLikeResponse = { ...SUCCESS, like };
        res.status(response.httpCode).json(response);
    })
);

challengeRouterV1.post(
    '/:id/comment/',
    routeLogger(v),
    authenticate,
    authorize,
    validateCommentPost,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const interactable = Interactable.CHALLENGE;
        const targetId = Number(req.params.id);
        const comment = req.body.comment;

        const createdComment = await CommentService.create(context, interactable, targetId, comment);
        const response = { ...SUCCESS, comment: createdComment };
        res.status(response.httpCode).json(response);
    })
);

challengeRouterV1.delete(
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

export default challengeRouterV1;
