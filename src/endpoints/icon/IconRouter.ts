import express from 'express';
import iconRouterLatest from './IconRouterLatest';

const iconRouter = express.Router();

iconRouter.use('/:version/icon', iconRouterLatest);
iconRouter.use('/icon', iconRouterLatest);

export default iconRouter;
