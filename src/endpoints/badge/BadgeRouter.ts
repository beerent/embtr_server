import express from 'express';
import badgeRouterLatest from './BadgeRouterLatest';

const badgeRouter = express.Router();

badgeRouter.use('/:version/badge', badgeRouterLatest);

export default badgeRouter;
