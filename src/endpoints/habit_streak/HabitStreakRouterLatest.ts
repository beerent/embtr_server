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
import {
    GetHabitStreakTiersResponse,
    CreateHabitStreakTier,
    UpdateHabitStreakTier,
    UpdateHabitStreakTierResponse,
    CreateHabitStreakTierResponse,
} from '@resources/types/requests/HabitStreakTypes';
import { HabitStreakTier } from '@resources/schema';
import { Context } from '@src/general/auth/Context';

const habitStreakRouterLatest = express.Router();
const v = '✓';

habitStreakRouterLatest.get(
    '/tiers',
    routeLogger(v),
    authenticate,
    authorizeAdmin,
    async (req, res) => {
        const context = await ContextService.get(req);

        const habitStreakTiers = await HabitStreakTierService.getAll(context);
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
        const context: Context = await ContextService.get(req);
        const request: CreateHabitStreakTier = req.body;
        const habitStreakTier: HabitStreakTier = request.habitStreakTier;

        const createdHabitStreakTier = await HabitStreakTierService.create(
            context,
            habitStreakTier
        );
        const response: CreateHabitStreakTierResponse = {
            habitStreakTier: createdHabitStreakTier,
            ...SUCCESS,
        };
        res.json(response);
    }
);

habitStreakRouterLatest.post(
    '/tier/:tierId',
    routeLogger(v),
    authenticate,
    authorizeAdmin,
    async (req, res) => {
        const context: Context = await ContextService.get(req);
        const tierId = Number(req.params.tierId);
        const request: UpdateHabitStreakTier = req.body;
        const habitStreakTier: HabitStreakTier = request.habitStreakTier;

        const updatedHabitStreakTier = await HabitStreakTierService.update(
            context,
            tierId,
            habitStreakTier
        );

        const response: UpdateHabitStreakTierResponse = {
            ...SUCCESS,
            habitStreakTier: updatedHabitStreakTier,
        };

        res.json(response);
    }
);

habitStreakRouterLatest.post(
    '/tier/:tierId/delete',
    routeLogger(v),
    authenticate,
    authorizeAdmin,
    async (req, res) => {
        const context: Context = await ContextService.get(req);
        const tierId = Number(req.params.tierId);

         await HabitStreakTierService.delete(
            context,
            tierId,
        );

        const response = {
            ...SUCCESS,
        };

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
