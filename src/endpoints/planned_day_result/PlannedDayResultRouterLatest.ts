import { PlannedDayResult } from '@resources/schema';
import { Interactable } from '@resources/types/interactable/Interactable';
import { PlannedDayResultSummary } from '@resources/types/planned_day_result/PlannedDayResult';
import { CreateLikeResponse } from '@resources/types/requests/GeneralTypes';
import {
    CreatePlannedDayResultResponse,
    GetPlannedDayResultResponse,
    GetPlannedDayResultSummariesResponse,
    GetPlannedDayResultsResponse,
    UpdatePlannedDayResultRequest,
    UpdatePlannedDayResultResponse,
} from '@resources/types/requests/PlannedDayResultTypes';
import { SUCCESS } from '@src/common/RequestResponses';
import { Context } from '@src/general/auth/Context';
import { authenticate } from '@src/middleware/authentication';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import {
    validateCommentDelete,
    validateCommentPost,
} from '@src/middleware/general/GeneralValidation';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import {
    validateGetById,
    validateGetByUser,
    validateLikePost,
    validatePatch,
    validatePost,
} from '@src/middleware/planned_day_result/PlannedDayResultValidation';
import { CommentService } from '@src/service/CommentService';
import { ContextService } from '@src/service/ContextService';
import { LikeService } from '@src/service/LikeService';
import { PlannedDayResultService } from '@src/service/PlannedDayResultService';
import { DateUtility } from '@src/utility/date/DateUtility';
import express from 'express';

const plannedDayResultRouterLatest = express.Router();
const v = '✓';

plannedDayResultRouterLatest.get(
    '/',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const lowerBound = DateUtility.getOptionalDate(req.query.lowerBound as string);
        const upperBound = DateUtility.getOptionalDate(req.query.upperBound as string);

        const plannedDayResults: PlannedDayResult[] = await PlannedDayResultService.getAll(
            context,
            lowerBound,
            upperBound
        );
        const response: GetPlannedDayResultsResponse = { ...SUCCESS, plannedDayResults };
        res.json(response);
    })
);

plannedDayResultRouterLatest.get(
    '/:id',
    routeLogger(v),
    authenticate,
    authorize,
    validateGetById,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);

        const plannedDayResult = await PlannedDayResultService.getById(context, id);
        const response: GetPlannedDayResultResponse = { ...SUCCESS, plannedDayResult };
        res.json(response);
    })
);

plannedDayResultRouterLatest.get(
    '/summaries',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const lowerBound = DateUtility.getOptionalDate(req.query.lowerBound as string);
        const upperBound = DateUtility.getOptionalDate(req.query.upperBound as string);

        const plannedDayResultSummaries: PlannedDayResultSummary[] =
            await PlannedDayResultService.getAllSummaries(context, lowerBound, upperBound);
        const response: GetPlannedDayResultSummariesResponse = {
            ...SUCCESS,
            plannedDayResultSummaries,
        };
        res.json(response);
    })
);

plannedDayResultRouterLatest.get(
    '/summary/:id',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);

        const summary: PlannedDayResultSummary = await PlannedDayResultService.getSummaryById(
            context,
            id
        );
        res.json(summary);
    })
);

plannedDayResultRouterLatest.get(
    '/:userId/:dayKey',
    routeLogger(v),
    authenticate,
    authorize,
    validateGetByUser,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const userId = Number(req.params.userId);
        const dayKey = req.params.dayKey;

        const plannedDayResult = await PlannedDayResultService.getByUserAndDayKey(
            context,
            userId,
            dayKey
        );
        const response: GetPlannedDayResultResponse = { ...SUCCESS, plannedDayResult };
        res.json(response);
    })
);

plannedDayResultRouterLatest.post(
    '/',
    routeLogger(v),
    authenticate,
    authorize,
    validatePost,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const plannedDayId = Number(req.body.plannedDayId);

        const plannedDayResult = await PlannedDayResultService.create(context, plannedDayId);
        const response: CreatePlannedDayResultResponse = { ...SUCCESS, plannedDayResult };
        res.json(response);
    })
);

plannedDayResultRouterLatest.patch(
    '/',
    routeLogger(v),
    authenticate,
    authorize,
    validatePatch,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const request: UpdatePlannedDayResultRequest = req.body;
        const plannedDayResult = request.plannedDayResult;

        const updatedPlannedDayResult = await PlannedDayResultService.update(
            context,
            plannedDayResult
        );
        const response: UpdatePlannedDayResultResponse = {
            ...SUCCESS,
            plannedDayResult: updatedPlannedDayResult,
        };
        res.json(response);
    })
);

plannedDayResultRouterLatest.post(
    '/:id/comment/',
    routeLogger(v),
    authenticate,
    authorize,
    validateCommentPost,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const interactable = Interactable.PLANNED_DAY_RESULT;
        const targetId = Number(req.params.id);
        const comment = req.body.comment;

        const createdComment = await CommentService.create(context, interactable, targetId, comment);
        const response = { ...SUCCESS, comment: createdComment };
        res.status(response.httpCode).json(response);
    })
);

plannedDayResultRouterLatest.delete(
    '/comment/:id',
    routeLogger(v),
    authenticate,
    authorize,
    validateCommentDelete,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const targetId = Number(req.params.id);

        await CommentService.delete(context, targetId);
        res.json(SUCCESS);
    })
);

plannedDayResultRouterLatest.post(
    '/:id/like/',
    routeLogger(v),
    authenticate,
    authorize,
    validateLikePost,
    runEndpoint(async (req, res) => {
        const context: Context = await ContextService.get(req);
        const targetId = parseInt(req.params.id);
        const interactable = Interactable.PLANNED_DAY_RESULT;

        const like = await LikeService.create(context, interactable, targetId);
        const response: CreateLikeResponse = { ...SUCCESS, like };
        res.status(response.httpCode).json(response);
    })
);

export default plannedDayResultRouterLatest;
