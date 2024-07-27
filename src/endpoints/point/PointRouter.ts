import express from 'express';
import pointRouterLatest from './PointRouterLatest';

const pointRouter = express.Router();

pointRouter.use('/:version/point', pointRouterLatest);

export default pointRouter;
