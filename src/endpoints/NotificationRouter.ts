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

const notificationRouter = express.Router();

notificationRouter.get(
    '/v1/',
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const notifications = await NotificationService.getAll(context);

        const response: GetNotificationsResponse = { ...SUCCESS, notifications };
        res.json(response);
    })
);

notificationRouter.get(
    '/v1/count',
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const count = await NotificationService.getUnreadNotificationCount(context);

        const response: GetUnreadNotificationCountResponse = { ...SUCCESS, count };
        res.json(response);
    })
);

notificationRouter.post(
    '/v1/clear',
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        await NotificationService.clear(context);

        res.json(SUCCESS);
    })
);

export default notificationRouter;
