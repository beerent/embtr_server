import express from 'express';
import notificationRouterV1 from '@src/endpoints/notification/NotificationRouterV1';

const notificationRouter = express.Router();

notificationRouter.use('/v1/notification', notificationRouterV1);

//default fallback is always latest
notificationRouter.use('/:version/notification', notificationRouterV1);

export default notificationRouter;
