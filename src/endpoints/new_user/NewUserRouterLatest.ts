import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { ContextService } from '@src/service/ContextService';
import { SUCCESS } from '@src/common/RequestResponses';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { GetNewUserChecklistResponse } from '@resources/types/requests/UserTypes';
import { NewUserChecklistService } from '@src/service/feature/NewUserChecklistService';
import { GetBooleanResponse } from '@resources/types/requests/GeneralTypes';

const newUserRouterLatest = express.Router();
const v = '✓';

newUserRouterLatest.get(
  '/checklist',
  routeLogger(v),
  authenticate,
  runEndpoint(async (req, res) => {
    const context = await ContextService.get(req);

    const checklist = await NewUserChecklistService.get(context);
    const response: GetNewUserChecklistResponse = { ...SUCCESS, checklist };

    res.json(response);
  })
);

newUserRouterLatest.post(
  '/checklist/dismiss',
  routeLogger(v),
  authenticate,
  runEndpoint(async (req, res) => {
    const context = await ContextService.get(req);
    await NewUserChecklistService.dismiss(context);

    res.json(SUCCESS);
  })
);

newUserRouterLatest.post(
  '/checklist/complete',
  routeLogger(v),
  authenticate,
  runEndpoint(async (req, res) => {
    const context = await ContextService.get(req);
    await NewUserChecklistService.complete(context);

    res.json(SUCCESS);
  })
);

newUserRouterLatest.get(
  '/checklist/dismissed',
  routeLogger(v),
  authenticate,
  runEndpoint(async (req, res) => {
    const context = await ContextService.get(req);
    const isDismissed = await NewUserChecklistService.getIsDismissed(context);

    const response: GetBooleanResponse = { ...SUCCESS, result: isDismissed };
    res.json(response);
  })
);

newUserRouterLatest.get(
  '/checklist/completed',
  routeLogger(v),
  authenticate,
  runEndpoint(async (req, res) => {
    const context = await ContextService.get(req);
    const isCompleted = await NewUserChecklistService.getIsCompleted(context);

    const response: GetBooleanResponse = { ...SUCCESS, result: isCompleted };
    res.json(response);
  })
);

export default newUserRouterLatest;
