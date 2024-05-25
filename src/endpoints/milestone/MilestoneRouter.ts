import express from 'express';
import milestoneRouterLatest from './MilestoneRouterLatest'

const milestoneRouter = express.Router()

milestoneRouter.use('/:version/milestone', milestoneRouterLatest);

export default milestoneRouter;
