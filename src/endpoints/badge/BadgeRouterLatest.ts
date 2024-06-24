import { SUCCESS } from '@src/common/RequestResponses';
import { authenticate } from '@src/middleware/authentication';
import express from 'express';
import { authorizeAdmin } from '@src/middleware/general/GeneralAuthorization';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { BadgeService } from '@src/service/BadgeService';
import { CreateBadge, CreateBadgeResponse, GetAllBadgesResponse, UpdateBadge, UpdateBadgeResponse } from '@resources/types/requests/BadgeTypes';
import { Context } from '@src/general/auth/Context';
import { ContextService } from '@src/service/ContextService';
import { Badge } from '@resources/schema';

const badgeRouterLatest = express.Router();
const v = '✓';

badgeRouterLatest.get('/all', routeLogger(v), authenticate, authorizeAdmin, async (req, res) => {
    const badges = await BadgeService.getAll()

    const response: GetAllBadgesResponse = { ...SUCCESS, badges };
    res.json(response);
});

badgeRouterLatest.post('/', routeLogger(v), authenticate, authorizeAdmin, async (req, res) => {
    const context: Context = await ContextService.get(req);
    const request: CreateBadge = req.body;
    const badge: Badge = request.badge;

    const createdBadge = await BadgeService.create(
        context,
        badge
    );
    const response: CreateBadgeResponse = {
        badge: createdBadge,
        ...SUCCESS,
    };
    res.json(response);
});

badgeRouterLatest.post(
    '/badge/:badgeId',
    routeLogger(v),
    authenticate,
    authorizeAdmin,
    async (req, res) => {
        const context: Context = await ContextService.get(req);
        const badgeId = Number(req.params.badgeId);
        const request: UpdateBadge = req.body;
        const badge: Badge = request.badge;

        const updatedBadge = await BadgeService.update(
            context,
            badgeId,
            badge
        );

        const response: UpdateBadgeResponse = {
            ...SUCCESS,
            badge: updatedBadge
        };

        res.json(response);
    }
);
export default badgeRouterLatest
