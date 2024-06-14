import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { ContextService } from '@src/service/ContextService';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { SUCCESS } from '@src/common/RequestResponses';
import { DetailedHabitStreakService } from '@src/service/DetailedHabitStreakService';
import { GetHabitStreakResponse } from '@resources/types/requests/HabitTypes';

const habitStreakRouterLatest = express.Router();
const v = '✓';

habitStreakRouterLatest.get(
    '/advanced/:userId',
    routeLogger(v),
    authenticate,
    authorize,
    async (req, res) => {
        const context = await ContextService.get(req);
        const userId = Number(req.params.userId);

        const habitStreak = await DetailedHabitStreakService.getAdvanced(context, userId);
        const response: GetHabitStreakResponse = {
            ...SUCCESS,
            habitStreak,
        };

        res.json(response);
    }
);

habitStreakRouterLatest.get(
    '/advanced/:userId/:habitId',
    routeLogger(v),
    authenticate,
    authorize,
    async (req, res) => {
        const context = await ContextService.get(req);
        const userId = Number(req.params.userId);
        const habitId = Number(req.params.habitId);

        const habitStreak = await DetailedHabitStreakService.getAdvanced(context, userId, habitId);
        const response: GetHabitStreakResponse = {
            ...SUCCESS,
            habitStreak,
        };

        res.json(response);
    }
);

habitStreakRouterLatest.get(
    '/:userId/',
    routeLogger(v),
    authenticate,
    authorize,
    async (req, res) => {
        const context = await ContextService.get(req);
        const userId = Number(req.params.userId);

        const habitStreak = await DetailedHabitStreakService.getBasic(context, userId);
        const response: GetHabitStreakResponse = {
            ...SUCCESS,
            habitStreak,
        };

        res.json(response);
    }
);

habitStreakRouterLatest.get(
    '/:userId/:habitId/',
    routeLogger(v),
    authenticate,
    authorize,
    async (req, res) => {
        const context = await ContextService.get(req);
        const userId = Number(req.params.userId);
        const habitId = Number(req.params.habitId);

        const habitStreak = await DetailedHabitStreakService.getBasic(context, userId, habitId);
        const response: GetHabitStreakResponse = {
            ...SUCCESS,
            habitStreak,
        };

        res.json(response);
    }
);

export default habitStreakRouterLatest;
