import { GetAllMetadataResponse } from '@resources/types/requests/MetadataTypes';
import { SUCCESS } from '@src/common/RequestResponses';
import { authenticate } from '@src/middleware/authentication';
import { ContextService } from '@src/service/ContextService';
import { MetadataService } from '@src/service/MetadataService';
import express from 'express';
import { authorize } from '@src/middleware/general/GeneralAuthorization';

const metadataRouter = express.Router();

metadataRouter.get(['/', '/v1/'], authenticate, authorize, async (req, res) => {
    const context = await ContextService.get(req);
    const metadata = await MetadataService.getAll(context);

    const response: GetAllMetadataResponse = { ...SUCCESS, metadata };
    res.json(response);
});

export default metadataRouter;
