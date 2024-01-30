import express from 'express';
import challengeRouterV1 from '@src/endpoints/challenge/ChallengeRouterV1';

const challengeRouter = express.Router();

challengeRouter.use('/v1/challenge', challengeRouterV1);

//default fallback is always latest
challengeRouter.use('/:version/challenge', challengeRouterV1);

export default challengeRouter;
