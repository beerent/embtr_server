import express from 'express';
import challengeRouterLatest from './ChallengeRouterLatest';
import challengeRouterV3 from './ChallengeRouterV3';

const challengeRouter = express.Router();

const versionRanges = [{ min: 1, max: 3 }];
versionRanges.forEach((range) => {
    for (let i = range.min; i <= range.max; i++) {
        challengeRouter.use(`/v${i}/challenge`, challengeRouterV3);
    }
});

challengeRouter.use('/:version/challenge', challengeRouterLatest);

export default challengeRouter;
