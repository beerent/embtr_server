import express from 'express';
import tutorialRouterLatest from './TutorialRouterLatest';

const tutorialRouter = express.Router();

tutorialRouter.use('/:version/tutorial', tutorialRouterLatest);

export default tutorialRouter;
