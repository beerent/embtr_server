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
        const response = await LikeService.create(Interactable.CHALLENGE, req);
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
        const response = await CommentService.create(Interactable.CHALLENGE, req);
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
        const response = await CommentService.delete(req);
        res.status(response.httpCode).json(response);
    })
);

export default challengeRouterV1;
