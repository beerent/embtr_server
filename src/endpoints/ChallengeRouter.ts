import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { ChallengeService } from '@src/service/ChallengeService';
import { validateChallengeRegister } from '@src/middleware/challenge/ChallengeValidation';
import { validateCommentPost, validateLikePost } from '@src/middleware/general/GeneralValidation';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { LikeService } from '@src/service/LikeService';
import { Interactable } from '@resources/types/interactable/Interactable';
import { CommentService } from '@src/service/CommentService';

const challengeRouter = express.Router();

challengeRouter.get('/', authenticate, authorize, async (req, res) => {
    const response = await ChallengeService.getAll();
    res.status(response.httpCode).json(response);
});

challengeRouter.get('/:id', authenticate, authorize, async (req, res) => {
    const response = await ChallengeService.get(Number(req.params.id));
    res.status(response.httpCode).json(response);
});

challengeRouter.post(
    '/:id/register',
    authenticate,
    authorize,
    validateChallengeRegister,
    runEndpoint(async (req, res) => {
        const response = await ChallengeService.register(req);
        res.status(response.httpCode).json(response);
    })
);

challengeRouter.post(
    '/:id/like',
    authenticate,
    authorize,
    validateLikePost,
    runEndpoint(async (req, res) => {
        const response = await LikeService.create(Interactable.CHALLENGE, req);
        res.status(response.httpCode).json(response);
    })
);

challengeRouter.post(
    '/:id/comment/',
    authenticate,
    authorize,
    validateCommentPost,
    runEndpoint(async (req, res) => {
        const response = await CommentService.create(Interactable.CHALLENGE, req);
        res.status(response.httpCode).json(response);
    })
);

export default challengeRouter;
