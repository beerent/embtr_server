import express from 'express';
import jobRouterLatest from './JobRouterLatest';

const jobRouter = express.Router();

jobRouter.use('/:version/job', jobRouterLatest);
jobRouter.use('/job', jobRouterLatest);

export default jobRouter;
