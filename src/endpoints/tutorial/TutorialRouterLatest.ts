import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { ContextService } from '@src/service/ContextService';
import { SUCCESS } from '@src/common/RequestResponses';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { HabitService } from '@src/service/HabitService';
import {
    GetHabitsResponse,
    TutorialHabitSelectedRequest,
} from '@resources/types/requests/HabitTypes';
import { ScheduledHabitService } from '@src/service/ScheduledHabitService';

const tutorialRouterLatest = express.Router();
const v = '✓';

tutorialRouterLatest.get(
    '/recommended',
    routeLogger(v),
    authenticate,
    authorize,
    async (req, res) => {
        const context = await ContextService.get(req);
        const habits = await HabitService.getTutorialRecommended(context);
        const response: GetHabitsResponse = { ...SUCCESS, habits };
        res.json(response);
    }
);

tutorialRouterLatest.post(
    '/selected',
    routeLogger(v),
    authenticate,
    authorize,
    async (req, res) => {
        const context = await ContextService.get(req);
        const request: TutorialHabitSelectedRequest = req.body;

        await ScheduledHabitService.createFromTutorial(context, request.id, request.text);
        res.json(SUCCESS);
    }
);

export default tutorialRouterLatest;
