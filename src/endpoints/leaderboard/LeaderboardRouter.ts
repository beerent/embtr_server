import express from 'express';
import leaderboardRouterLatest from './leaderboardRouterLatest';

const leaderboardRouter = express.Router();

leaderboardRouter.use('/:version/leaderboard', leaderboardRouterLatest);

export default leaderboardRouter;
