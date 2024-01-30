import express from 'express';
import metadataRouterV1 from '@src/endpoints/metadata/MetadataRouterV1';

const metadataRouter = express.Router();

metadataRouter.use('/v1/metadata', metadataRouterV1);

//default fallback is always latest
metadataRouter.use('/:version/metadata', metadataRouterV1);

export default metadataRouter;
