import express from 'express';
import tageRouterLatest from './TagRouterLatest';

const tagRouter = express.Router();

tagRouter.use('/:version/tag', tageRouterLatest);

export default tagRouter;
