import express from 'express';
import featureRouterLatest from './FeatureRouterLatest';

const featureRouter = express.Router();

featureRouter.use('/:version/feature', featureRouterLatest);

export default featureRouter;
