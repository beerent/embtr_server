import { Interactable } from '@resources/types/interactable/Interactable';
import { GetAllUserPostResponse } from '@resources/types/requests/UserPostTypes';
import { authenticate } from '@src/middleware/authentication';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import {
    validateCommentDelete,
    validateCommentPost,
} from '@src/middleware/general/GeneralValidation';
import { validateGetAllPlannedDayResults } from '@src/middleware/planned_day_result/PlannedDayResultValidation';
import {
    validateGetById,
    validateLike,
    validatePost,
    validateUpdate,
} from '@src/middleware/user_post/UserPostValidation';
import { CommentService } from '@src/service/CommentService';
import { LikeService } from '@src/service/LikeService';
import { UserPostService } from '@src/service/UserPostService';
import express from 'express';

const userPostRouter = express.Router();

userPostRouter.post(
    '/',
    authenticate,
    authorize,
    validatePost,
    runEndpoint(async (req, res) => {
        const response = await UserPostService.create(req);
        res.status(response.httpCode).json(response);
    })
);

userPostRouter.get(
    '/',
    authenticate,
    authorize,
    validateGetAllPlannedDayResults,
    runEndpoint(async (req, res) => {
        const response: GetAllUserPostResponse = await UserPostService.getAll(req);
        res.status(response.httpCode).json(response);
    })
);

userPostRouter.get(
    '/:id',
    authenticate,
    authorize,
    validateGetById,
    runEndpoint(async (req, res) => {
        const id = Number(req.params.id);

        const response = await UserPostService.getById(id);
        res.status(response.httpCode).json(response);
    })
);

userPostRouter.patch(
    '/',
    authenticate,
    authorize,
    validateUpdate,
    runEndpoint(async (req, res) => {
        const response = await UserPostService.update(req);
        res.status(response.httpCode).json(response);
    })
);

userPostRouter.post(
    '/:id/like',
    authenticate,
    authorize,
    validateLike,
    runEndpoint(async (req, res) => {
        const response = await LikeService.create(Interactable.USER_POST, req);
        res.status(response.httpCode).json(response);
    })
);

userPostRouter.post(
    '/:id/comment/',
    authenticate,
    authorize,
    validateCommentPost,
    runEndpoint(async (req, res) => {
        const response = await CommentService.create(Interactable.USER_POST, req);
        res.status(response.httpCode).json(response);
    })
);

userPostRouter.delete(
    '/comment/:id',
    authenticate,
    authorize,
    validateCommentDelete,
    runEndpoint(async (req, res) => {
        const response = await CommentService.delete(req);
        res.status(response.httpCode).json(response);
    })
);

export default userPostRouter;
