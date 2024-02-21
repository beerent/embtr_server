import {
    GetNotificationsResponse,
    GetUnreadNotificationCountResponse,
} from '@resources/types/requests/NotificationTypes';
import { SUCCESS } from '@src/common/RequestResponses';
import { authenticate } from '@src/middleware/authentication';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { ContextService } from '@src/service/ContextService';
import { NotificationService } from '@src/service/NotificationService';
import express from 'express';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';

const notificationRouterLatest = express.Router();
const v = '✓';

notificationRouterLatest.get(
    '/',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const notifications = await NotificationService.getAll(context);

        const response: GetNotificationsResponse = { ...SUCCESS, notifications };
        res.json(response);
    })
);

notificationRouterLatest.get(
    '/count',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const count = await NotificationService.getUnreadNotificationCount(context);

        const response: GetUnreadNotificationCountResponse = { ...SUCCESS, count };
        res.json(response);
    })
);

notificationRouterLatest.post(
    '/clear',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        await NotificationService.clear(context);

        res.json(SUCCESS);
    })
);

export default notificationRouterLatest;
