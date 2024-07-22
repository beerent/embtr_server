import express from 'express';
import levelRouterLatest from './LevelRouterLatest';

const levelRouter = express.Router();

levelRouter.use('/:version/level', levelRouterLatest);

export default levelRouter;
