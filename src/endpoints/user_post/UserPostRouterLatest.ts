import express from 'express';
import { Interactable } from '@resources/types/interactable/Interactable';
import {
    CreateUserPostRequest,
    CreateUserPostResponse,
    GetAllUserPostResponse,
    GetUserPostResponse,
    UpdateUserPostRequest,
} from '@resources/types/requests/UserPostTypes';
import { SUCCESS } from '@src/common/RequestResponses';
import { authenticate } from '@src/middleware/authentication';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import {
    validateCommentDelete,
    validateCommentPost,
} from '@src/middleware/general/GeneralValidation';
import {
    validateGetById,
    validateLike,
    validatePost,
    validateUpdate,
} from '@src/middleware/user_post/UserPostValidation';
import { CommentService } from '@src/service/CommentService';
import { ContextService } from '@src/service/ContextService';
import { LikeService } from '@src/service/LikeService';
import { UserPostService } from '@src/service/UserPostService';
import { DateUtility } from '@src/utility/date/DateUtility';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';

const userPostRouterLatest = express.Router();
const v = '✓';

userPostRouterLatest.post(
    '/',
    routeLogger(v),
    authenticate,
    authorize,
    validatePost,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const request: CreateUserPostRequest = req.body;
        const userPost = request.userPost;

        const createdUserPost = await UserPostService.create(context, userPost);
        const response: CreateUserPostResponse = { ...SUCCESS, userPost: createdUserPost };
        res.json(response);
    })
);

userPostRouterLatest.get(
    '/',
    routeLogger(v),
    authenticate,
    authorize,
    //validateGetAllPlannedDayResults,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const lowerBound = DateUtility.getOptionalDate(req.query.lowerBound as string);
        const upperBound = DateUtility.getOptionalDate(req.query.upperBound as string);

        const userPosts = await UserPostService.getAllBounded(context, lowerBound, upperBound);
        const response: GetAllUserPostResponse = { ...SUCCESS, userPosts };
        res.json(response);
    })
);

userPostRouterLatest.get(
    '/:id',
    routeLogger(v),
    authenticate,
    authorize,
    validateGetById,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);

        const userPost = await UserPostService.getById(context, id);
        const response: GetUserPostResponse = { ...SUCCESS, userPost };
        res.json(response);
    })
);

userPostRouterLatest.patch(
    '/',
    routeLogger(v),
    authenticate,
    authorize,
    validateUpdate,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const request: UpdateUserPostRequest = req.body;
        const userPost = request.userPost;

        const updatedUserPost = await UserPostService.update(context, userPost);
        const response: CreateUserPostResponse = { ...SUCCESS, userPost: updatedUserPost };
        res.json(response);
    })
);

userPostRouterLatest.post(
    '/:id/like',
    routeLogger(v),
    authenticate,
    authorize,
    validateLike,
    runEndpoint(async (req, res) => {
        const response = await LikeService.create(Interactable.USER_POST, req);
        res.status(response.httpCode).json(response);
    })
);

userPostRouterLatest.post(
    '/:id/comment/',
    routeLogger(v),
    authenticate,
    authorize,
    validateCommentPost,
    runEndpoint(async (req, res) => {
        const response = await CommentService.create(Interactable.USER_POST, req);
        res.status(response.httpCode).json(response);
    })
);

userPostRouterLatest.delete(
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

export default userPostRouterLatest;
