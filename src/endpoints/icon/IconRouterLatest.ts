import { CreateIconRequest, CreateIconResponse } from '@resources/types/requests/IconTypes';
import { authenticate } from '@src/middleware/authentication';
import { authorizeAdmin } from '@src/middleware/general/GeneralAuthorization';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { ContextService } from '@src/service/ContextService';
import { SUCCESS } from '@src/common/RequestResponses';
import express from 'express';
import { IconCreationService } from '@src/service/feature/IconCreationService';

const iconRouterLatest = express.Router();
const v = '✓';

iconRouterLatest.post('/', routeLogger(v), authenticate, authorizeAdmin, async (req, res) => {
  const context = await ContextService.get(req);
  const request: CreateIconRequest = req.body;
  const icon = request.icon;
  const tags = request.tags ?? [];
  const categories = request.categories ?? [];

  const createdIcon = await IconCreationService.create(context, icon, categories, tags);
  const response: CreateIconResponse = { ...SUCCESS, icon: createdIcon };

  res.json(response);
});

export default iconRouterLatest;
