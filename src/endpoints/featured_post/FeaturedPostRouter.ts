import express from 'express';
import featuredPostRouterLatest from './FeaturedPostRouterLatest';

const featuredPostRouter = express.Router();

featuredPostRouter.use('/:version/featured-post', featuredPostRouterLatest);

export default featuredPostRouter;
