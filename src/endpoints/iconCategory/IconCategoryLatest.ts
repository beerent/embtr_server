import { authenticate } from '@src/middleware/authentication';
import { authorizeAdmin } from '@src/middleware/general/GeneralAuthorization';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { SUCCESS } from '@src/common/RequestResponses';
import express from 'express';
import { IconCategoryService } from '@src/service/IconCategoryService';
import { GetIconCategoriesResponse } from '@resources/types/requests/IconCategoryTypes';

const iconCategoryRouterLatest = express.Router();
const v = '✓';

iconCategoryRouterLatest.get(
  '/all',
  routeLogger(v),
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    const iconCategories = await IconCategoryService.getAll()
    const response: GetIconCategoriesResponse = { ...SUCCESS, iconCategories };

    res.json(response);
  }
);

export default iconCategoryRouterLatest;
