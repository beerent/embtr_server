import { PlannedDayResult } from '@resources/schema';
import { Interactable } from '@resources/types/interactable/Interactable';
import { PlannedDayResultSummary } from '@resources/types/planned_day_result/PlannedDayResult';
import {
    CreatePlannedDayResultResponse,
    GetPlannedDayResultRequest,
    GetPlannedDayResultResponse,
    GetPlannedDayResultSummariesResponse,
    GetPlannedDayResultsResponse,
    UpdatePlannedDayResultRequest,
    UpdatePlannedDayResultResponse,
} from '@resources/types/requests/PlannedDayResultTypes';
import { GetUserResponse } from '@resources/types/requests/UserTypes';
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
    validateGetByUser,
    validateLikePost,
    validatePatch,
    validatePlannedDayResultHideRecommendation,
    validatePost,
} from '@src/middleware/planned_day_result/PlannedDayResultValidation';
import { CommentService } from '@src/service/CommentService';
import { ContextService } from '@src/service/ContextService';
import { LikeService } from '@src/service/LikeService';
import { PlannedDayResultService } from '@src/service/PlannedDayResultService';
import { DateUtility } from '@src/utility/date/DateUtility';
import express from 'express';

const plannedDayResultRouter = express.Router();

plannedDayResultRouter.get(
    ['/', '/v1/'],
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

plannedDayResultRouter.get(
    ['/:id', '/v1/:id'],
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

plannedDayResultRouter.get(
    ['/summaries', '/v1/summaries'],
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

plannedDayResultRouter.get(
    ['/summary/:id', '/v1/summary/:id'],
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

plannedDayResultRouter.get(
    ['/:userId/:dayKey', '/v1/:userId/:dayKey'],
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

plannedDayResultRouter.post(
    ['/', '/v1/'],
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

plannedDayResultRouter.patch(
    ['/', '/v1/'],
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

plannedDayResultRouter.post(
    ['/:id/comment/', '/v1/:id/comment/'],
    authenticate,
    authorize,
    validateCommentPost,
    runEndpoint(async (req, res) => {
        const response = await CommentService.create(Interactable.PLANNED_DAY_RESULT, req);
        res.status(response.httpCode).json(response);
    })
);

plannedDayResultRouter.delete(
    ['/comment/:id', '/v1/comment/:id'],
    authenticate,
    authorize,
    validateCommentDelete,
    runEndpoint(async (req, res) => {
        const response = await CommentService.delete(req);
        res.status(response.httpCode).json(response);
    })
);

plannedDayResultRouter.post(
    ['/:id/like/', '/v1/:id/like/'],
    authenticate,
    authorize,
    validateLikePost,
    runEndpoint(async (req, res) => {
        const response = await LikeService.create(Interactable.PLANNED_DAY_RESULT, req);
        res.status(response.httpCode).json(response);
    })
);

export default plannedDayResultRouter;
