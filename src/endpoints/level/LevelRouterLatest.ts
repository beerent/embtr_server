import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { ContextService } from '@src/service/ContextService';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { SUCCESS } from '@src/common/RequestResponses';
import { LevelService } from '@src/service/LevelService';
import { GetLevelsResponse } from '@resources/types/requests/LevelTypes';

const levelRouterLatest = express.Router();
const v = '✓';

levelRouterLatest.get('/', routeLogger(v), authenticate, authorize, async (req, res) => {
  const context = await ContextService.get(req);

  const levels = await LevelService.getAll(context);
  const response: GetLevelsResponse = { ...SUCCESS, levels };

  res.json(response);
});

export default levelRouterLatest;
