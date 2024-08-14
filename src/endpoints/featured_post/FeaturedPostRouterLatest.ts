import express from 'express';
import { Constants } from '@resources/types/constants/constants';
import { SUCCESS } from '@src/common/RequestResponses';
import { authenticate } from '@src/middleware/authentication';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import {
    validateCommentDelete,
    validateCommentPost,
} from '@src/middleware/general/GeneralValidation';
import { validateLike } from '@src/middleware/user_post/UserPostValidation';
import { CommentService } from '@src/service/CommentService';
import { ContextService } from '@src/service/ContextService';
import { LikeService } from '@src/service/LikeService';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import {
    CreateCommentRequest,
    CreateCommentResponse,
    CreateLikeResponse,
} from '@resources/types/requests/GeneralTypes';
import { FeaturedPostService } from '@src/service/FeaturedPostService';
import { GetFeaturedPostResponse } from '@resources/types/requests/FeaturedPostTypes';

const featuredPostRouterLatest = express.Router();
const v = '✓';

featuredPostRouterLatest.get(
    '/:id/',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);

        const featuredPost = await FeaturedPostService.get(context, id);
        const response: GetFeaturedPostResponse = { ...SUCCESS, featuredPost };
        res.json(response);
    })
);

featuredPostRouterLatest.post(
    '/:id/like',
    routeLogger(v),
    authenticate,
    authorize,
    validateLike,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const targetId = Number(req.params.id);

        console.log('targetId', targetId);

        const like = await LikeService.create(
            context,
            Constants.Interactable.FEATURED_POST,
            targetId
        );
        const response: CreateLikeResponse = { ...SUCCESS, like };
        res.status(response.httpCode).json(response);
    })
);

featuredPostRouterLatest.post(
    '/:id/comment/',
    routeLogger(v),
    authenticate,
    authorize,
    validateCommentPost,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const targetId = Number(req.params.id);
        const request: CreateCommentRequest = req.body;
        const comment = request.comment;

        const createdComment = await CommentService.create(
            context,
            Constants.Interactable.FEATURED_POST,
            targetId,
            comment
        );
        const response: CreateCommentResponse = { ...SUCCESS, comment: createdComment };

        res.status(response.httpCode).json(response);
    })
);

featuredPostRouterLatest.delete(
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

export default featuredPostRouterLatest;
