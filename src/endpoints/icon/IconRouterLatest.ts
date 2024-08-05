import {
  CreateIconRequest,
  CreateIconResponse,
  DeleteIconRequest,
  GetIconResponse,
  GetIconsResponse,
  UpdateIconRequest,
  UpdateIconResponse,
} from '@resources/types/requests/IconTypes';
import { authenticate } from '@src/middleware/authentication';
import { authorize, authorizeAdmin } from '@src/middleware/general/GeneralAuthorization';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { ContextService } from '@src/service/ContextService';
import { SUCCESS } from '@src/common/RequestResponses';
import express from 'express';
import { IconCreationService } from '@src/service/feature/IconCreationService';
import { IconService } from '@src/service/IconService';

const iconRouterLatest = express.Router();
const v = '✓';

iconRouterLatest.get('/all', routeLogger(v), authenticate, authorizeAdmin, async (req, res) => {
  const icons = await IconService.getAll();
  const response: GetIconsResponse = { ...SUCCESS, icons };

  res.json(response);
});

iconRouterLatest.get('/:key', routeLogger(v), authenticate, authorize, async (req, res) => {
  const context = await ContextService.get(req);
  const key = req.params.key;

  const icon = await IconService.getByKey(context, key);
  const response: GetIconResponse = { ...SUCCESS, icon };

  res.json(response);
});

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

iconRouterLatest.post('/update', routeLogger(v), authenticate, authorizeAdmin, async (req, res) => {
  const context = await ContextService.get(req);
  const request: UpdateIconRequest = req.body;
  const icon = await IconService.update(context, request.id, request.data);
  const response: UpdateIconResponse = { ...SUCCESS, icon };

  res.json(response);
});

iconRouterLatest.post('/delete', routeLogger(v), authenticate, authorizeAdmin, async (req, res) => {
  const request: DeleteIconRequest = req.body;
  await IconService.delete(request.id);

  res.json({ ...SUCCESS });
});

export default iconRouterLatest;
