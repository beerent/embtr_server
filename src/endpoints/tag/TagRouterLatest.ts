import { authenticate } from '@src/middleware/authentication';
import { authorizeAdmin } from '@src/middleware/general/GeneralAuthorization';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { SUCCESS } from '@src/common/RequestResponses';
import express from 'express';
import { TagService } from '@src/service/TagService';
import { GetTagsResponse } from '@resources/types/requests/TagTypes';

const tagRouterLatest = express.Router();
const v = '✓';

tagRouterLatest.get(
  '/all',
  routeLogger(v),
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    const tags = await TagService.getAll()
    const response: GetTagsResponse = { ...SUCCESS, tags };

    res.json(response);
  }
);

export default tagRouterLatest;
