import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize, authorizeAdmin } from '@src/middleware/general/GeneralAuthorization';
import { ContextService } from '@src/service/ContextService';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { SUCCESS } from '@src/common/RequestResponses';
import { DetailedHabitStreakService } from '@src/service/DetailedHabitStreakService';
import {
    GetHabitStreakResponse,
    GetSimpleHabitStreakResponse,
} from '@resources/types/requests/HabitTypes';
import { HabitStreakTierService } from '@src/service/HabitStreakTierService';
import { GetHabitStreakTiersResponse, CreateHabitStreakTier, UpdateHabitStreakTier, UpdateHabitStreakTierResponse, CreateHabitStreakTierResponse } from '@resources/types/requests/HabitStreakTypes';

const habitStreakRouterLatest = express.Router();
const v = '✓';

habitStreakRouterLatest.get(
    '/tiers',
    routeLogger(v),
    authenticate,
    authorizeAdmin,
    async (req, res) => {
        const context = await ContextService.get(req);

        const habitStreakTiers = await HabitStreakTierService.getAll(context)
        const response: GetHabitStreakTiersResponse = { ...SUCCESS, habitStreakTiers };
        res.json(response);
    }
);

habitStreakRouterLatest.post(
    '/tiers',
    routeLogger(v),
    authenticate,
    authorizeAdmin,
    async (req, res) => {
        const body: CreateHabitStreakTier = req.body

        const habitStreakTier = await HabitStreakTierService.create(body)
        const response: CreateHabitStreakTierResponse = { ...SUCCESS, habitStreakTier };
        res.json(response);
    }
);

habitStreakRouterLatest.post(
    '/tier/:tierId',
    routeLogger(v),
    authenticate,
    authorizeAdmin,
    async (req, res) => {
        const tierId = Number(req.params.tierId)
        const body: UpdateHabitStreakTier = req.body

        const habitStreakTier = await HabitStreakTierService.update(tierId, body)
        const response: UpdateHabitStreakTierResponse = { ...SUCCESS, habitStreakTier };
        res.json(response);
    }
);

habitStreakRouterLatest.get(
    '/simple/:userId/',
    routeLogger(v),
    authenticate,
    authorize,
    async (req, res) => {
        const context = await ContextService.get(req);
        const userId = Number(req.params.userId);

        const simpleHabitStreak = await DetailedHabitStreakService.getSimple(context, userId);
        const response: GetSimpleHabitStreakResponse = {
            simpleHabitStreak: simpleHabitStreak,
            ...SUCCESS,
        };

        res.json(response);
    }
);

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
