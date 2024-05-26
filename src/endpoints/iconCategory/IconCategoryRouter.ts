import express from 'express';
import iconCategoryRouterLatest from './IconCategoryLatest';

const iconCategoryRouter = express.Router();

iconCategoryRouter.use('/:version/icon-category', iconCategoryRouterLatest);

export default iconCategoryRouter;
