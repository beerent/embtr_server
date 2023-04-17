import { GetNotificationsResponse } from '@resources/types/requests/NotificationTypes';
import { authenticate } from '@src/middleware/authentication';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { validateClearNotifications } from '@src/middleware/notification/NotificationValidation';
import { NotificationService } from '@src/service/NotificationService';
import express from 'express';

const notificationRouter = express.Router();

notificationRouter.get(
    '/',
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const response: GetNotificationsResponse = await NotificationService.getAll(req);
        res.status(response.httpCode).json(response);
    })
);

notificationRouter.post(
    '/clear',
    authenticate,
    authorize,
    validateClearNotifications,
    runEndpoint(async (req, res) => {
        const response: GetNotificationsResponse = await NotificationService.clear(req);
        res.status(response.httpCode).json(response);
    })
);

export default notificationRouter;
