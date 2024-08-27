import { GetPushNotificationStatsResponse } from '@resources/types/requests/PushNotificationTypes';
import { SUCCESS } from '@src/common/RequestResponses';
import { authenticate } from '@src/middleware/authentication';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorizeAdmin } from '@src/middleware/general/GeneralAuthorization';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { ContextService } from '@src/service/ContextService';
import { PushNotificationReceiptService } from '@src/service/PushNotificationReceiptService';
import express from 'express';

const pushNotificationRouter = express.Router();
const v = '✓';

pushNotificationRouter.get(
  '/latest/push-notification/stats',
  routeLogger(v),
  authenticate,
  authorizeAdmin,
  runEndpoint(async (req, res) => {
    const context = await ContextService.getAdminContext(req);
    const stats = await PushNotificationReceiptService.getStats(context);
    console.log(stats);
    const response: GetPushNotificationStatsResponse = {
      stats,
      ...SUCCESS,
    };

    res.json(response);
  })
);

export default pushNotificationRouter;
