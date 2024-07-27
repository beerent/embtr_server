import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { SUCCESS } from '@src/common/RequestResponses';
import express from 'express';
import { ContextService } from '@src/service/ContextService';
import { PointDefinitionService } from '@src/service/PointDefinitionService';
import { GetPointDefinitionsResponse } from '@resources/types/requests/PointsTypes';

const pointRouterLatest = express.Router();
const v = '✓';

pointRouterLatest.get(
  '/definitions/',
  routeLogger(v),
  authenticate,
  authorize,
  async (req, res) => {
    const context = await ContextService.get(req);
    const definitions = await PointDefinitionService.getAllLatestVersions(context);
    const response: GetPointDefinitionsResponse = { ...SUCCESS, definitions };

    res.json(response);
  }
);

export default pointRouterLatest;
