import { SUCCESS } from '@src/common/RequestResponses';
import { authenticate } from '@src/middleware/authentication';
import express from 'express';
import { authorizeAdmin } from '@src/middleware/general/GeneralAuthorization';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { BadgeService } from '@src/service/BadgeService';
import { GetAllBadgesResponse } from '@resources/types/requests/BadgeTypes';

const badgeRouterLatest = express.Router();
const v = '✓';

badgeRouterLatest.get('/all', routeLogger(v), authenticate, authorizeAdmin, async (req, res) => {
    const badges = await BadgeService.getAll()

    const response: GetAllBadgesResponse = { ...SUCCESS, badges };
    res.json(response);
});

export default badgeRouterLatest
