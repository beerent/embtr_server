import { CreateIconRequest, CreateIconResponse, GetIconsResponse, UpdateIconRequest, UpdateIconResponse } from '@resources/types/requests/IconTypes';
import { authenticate } from '@src/middleware/authentication';
import { authorizeAdmin } from '@src/middleware/general/GeneralAuthorization';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { ContextService } from '@src/service/ContextService';
import { SUCCESS } from '@src/common/RequestResponses';
import express from 'express';
import { IconCreationService } from '@src/service/feature/IconCreationService';
import { IconService } from '@src/service/IconService';

const iconRouterLatest = express.Router();
const v = '✓';

iconRouterLatest.get(
  '/all',
  routeLogger(v),
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    const icons = await IconService.getAll()
    const response: GetIconsResponse = { ...SUCCESS, icons };

    res.json(response);
  }
);

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

iconRouterLatest.post(
  '/update',
  routeLogger(v),
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    const request: UpdateIconRequest = req.body;
    const icon = await IconService.update(request.id, request.data)
    const response: UpdateIconResponse = { ...SUCCESS, icon };

    res.json(response);
  }
);

export default iconRouterLatest;
