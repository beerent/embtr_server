import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { PremiumService } from '@src/service/PremiumService';
import { Context } from '@src/general/auth/Context';
import { ContextService } from '@src/service/ContextService';

const premiumRouterLatest = express.Router();
const v = '✓';

premiumRouterLatest.post(
  '/premiumPressed',
  routeLogger(v),
  authenticate,
  authorize,
  runEndpoint(async (req, res) => {
    const context: Context = await ContextService.get(req);
    const source = req.query.source as string;
    await PremiumService.premiumPressed(context, source);
  })
);

export default premiumRouterLatest;
