import express from 'express';
import challengeRouterLatest from './ChallengeRouterLatest';

const challengeRouter = express.Router();

challengeRouter.use('/:version/challenge', challengeRouterLatest);

export default challengeRouter;
