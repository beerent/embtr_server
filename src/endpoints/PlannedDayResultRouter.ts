import { Interactable } from '@resources/types/interactable/Interactable';
import {
    CreatePlannedDayResultRequest,
    GetPlannedDayResultRequest,
    GetPlannedDayResultResponse,
    GetPlannedDayResultSummariesResponse,
} from '@resources/types/requests/PlannedDayResultTypes';
import { GetUserResponse } from '@resources/types/requests/UserTypes';
import { authenticate } from '@src/middleware/authentication';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import {
    validateCommentDelete,
    validateCommentPost,
} from '@src/middleware/general/GeneralValidation';
import {
    validateGetById,
    validateGetByUser,
    validateLikePost,
    validatePatch,
    validatePlannedDayResultHideRecommendation,
    validatePost,
} from '@src/middleware/planned_day_result/PlannedDayResultValidation';
import { CommentService } from '@src/service/CommentService';
import { LikeService } from '@src/service/LikeService';
import { PlannedDayResultService } from '@src/service/PlannedDayResultService';
import express from 'express';

const plannedDayResultRouter = express.Router();

plannedDayResultRouter.get(
    '/',
    authenticate,
    authorize,
    //validateGetAllPlannedDayResults,
    runEndpoint(async (req, res) => {
        const response: GetPlannedDayResultResponse = await PlannedDayResultService.getAll(req);
        res.status(response.httpCode).json(response);
    })
);

plannedDayResultRouter.get(
    '/summaries',
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const response: GetPlannedDayResultSummariesResponse =
            await PlannedDayResultService.getAllSummaries(req);
        res.status(response.httpCode).json(response);
    })
);

plannedDayResultRouter.get(
    '/summary/:id',
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const id = Number(req.params.id);
        const response: GetPlannedDayResultSummariesResponse =
            await PlannedDayResultService.getSummaryById(id);
        res.status(response.httpCode).json(response);
    })
);

plannedDayResultRouter.get(
    '/:id',
    authenticate,
    authorize,
    validateGetById,
    runEndpoint(async (req, res) => {
        const id = Number(req.params.id);
        const response: GetUserResponse = await PlannedDayResultService.getById(id);

        res.status(response.httpCode).json(response);
    })
);

plannedDayResultRouter.get(
    '/:userId/:dayKey',
    authenticate,
    authorize,
    validateGetByUser,
    runEndpoint(async (req, res) => {
        const request: GetPlannedDayResultRequest = {
            userId: Number(req.params.userId),
            dayKey: req.params.dayKey,
        };

        const response: GetUserResponse = await PlannedDayResultService.getByUserAndDayKey(request);
        res.status(response.httpCode).json(response);
    })
);

plannedDayResultRouter.post(
    '/',
    authenticate,
    authorize,
    validatePost,
    runEndpoint(async (req, res) => {
        const response = await PlannedDayResultService.create(req);
        res.status(response.httpCode).json(response);
    })
);

plannedDayResultRouter.patch(
    '/',
    authenticate,
    authorize,
    validatePatch,
    runEndpoint(async (req, res) => {
        const response = await PlannedDayResultService.update(req);
        res.status(response.httpCode).json(response);
    })
);

plannedDayResultRouter.post(
    '/:id/comment/',
    authenticate,
    authorize,
    validateCommentPost,
    runEndpoint(async (req, res) => {
        const response = await CommentService.create(Interactable.PLANNED_DAY_RESULT, req);
        res.status(response.httpCode).json(response);
    })
);

plannedDayResultRouter.delete(
    '/comment/:id',
    authenticate,
    authorize,
    validateCommentDelete,
    runEndpoint(async (req, res) => {
        const response = await CommentService.delete(req);
        res.status(response.httpCode).json(response);
    })
);

plannedDayResultRouter.post(
    '/:id/like/',
    authenticate,
    authorize,
    validateLikePost,
    runEndpoint(async (req, res) => {
        const response = await LikeService.create(Interactable.PLANNED_DAY_RESULT, req);
        res.status(response.httpCode).json(response);
    })
);

plannedDayResultRouter.post(
    '/:dayKey/hide-recommendation/',
    authenticate,
    authorize,
    validatePlannedDayResultHideRecommendation,
    runEndpoint(async (req, res) => {
        const response = await PlannedDayResultService.hideRecommendation(req);
        res.status(response.httpCode).json(response);
    })
);

export default plannedDayResultRouter;
