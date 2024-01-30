import { PlannedDayResult } from '@resources/schema';
import { Interactable } from '@resources/types/interactable/Interactable';
import { PlannedDayResultSummary } from '@resources/types/planned_day_result/PlannedDayResult';
import {
    CreatePlannedDayResultResponse,
    GetPlannedDayResultResponse,
    GetPlannedDayResultSummariesResponse,
    GetPlannedDayResultsResponse,
    UpdatePlannedDayResultRequest,
    UpdatePlannedDayResultResponse,
} from '@resources/types/requests/PlannedDayResultTypes';
import { SUCCESS } from '@src/common/RequestResponses';
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

const plannedDayResultRouterV1 = express.Router();
const v = 'v1';

plannedDayResultRouterV1.get(
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

plannedDayResultRouterV1.get(
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

plannedDayResultRouterV1.get(
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

plannedDayResultRouterV1.get(
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

plannedDayResultRouterV1.get(
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

plannedDayResultRouterV1.post(
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

plannedDayResultRouterV1.patch(
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

plannedDayResultRouterV1.post(
    '/:id/comment/',
    routeLogger(v),
    authenticate,
    authorize,
    validateCommentPost,
    runEndpoint(async (req, res) => {
        const response = await CommentService.create(Interactable.PLANNED_DAY_RESULT, req);
        res.status(response.httpCode).json(response);
    })
);

plannedDayResultRouterV1.delete(
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

plannedDayResultRouterV1.post(
    '/:id/like/',
    routeLogger(v),
    authenticate,
    authorize,
    validateLikePost,
    runEndpoint(async (req, res) => {
        const response = await LikeService.create(Interactable.PLANNED_DAY_RESULT, req);
        res.status(response.httpCode).json(response);
    })
);

export default plannedDayResultRouterV1;
