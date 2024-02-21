import express from 'express';
import metadataRouterLatest from './MetadataRouterLatest';

const metadataRouter = express.Router();

metadataRouter.use('/:version/metadata', metadataRouterLatest);

export default metadataRouter;
