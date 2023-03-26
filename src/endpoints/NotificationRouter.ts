import { ClearNotificationsRequest, GetNotificationsResponse } from '@resources/types/NotificationTypes';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { validateClearNotifications } from '@src/middleware/notification/NotificationValidation';
import { NotificationService } from '@src/service/NotificationService';
import express from 'express';

const notificationRouter = express.Router();

notificationRouter.get('/', authenticate, authorize, async (req, res) => {
    const response: GetNotificationsResponse = await NotificationService.getAll(req);

    res.status(response.httpCode).json(response);
});

notificationRouter.post('/clear', authenticate, authorize, validateClearNotifications, async (req, res) => {
    const response: GetNotificationsResponse = await NotificationService.clear(req);
    res.status(response.httpCode).json(response);
});

export default notificationRouter;
