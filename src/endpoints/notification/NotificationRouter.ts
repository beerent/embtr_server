import express from 'express';
import notificationRouterLatest from './NotificationRouterLatest';

const notificationRouter = express.Router();

notificationRouter.use('/:version/notification', notificationRouterLatest);

export default notificationRouter;
