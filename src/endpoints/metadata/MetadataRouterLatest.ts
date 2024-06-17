import { CreateMetadataRequest, CreateMetadataResponse, GetAllMetadataResponse, UpdateMetadataRequest, UpdateMetadataResponse } from '@resources/types/requests/MetadataTypes';
import { SUCCESS } from '@src/common/RequestResponses';
import { authenticate } from '@src/middleware/authentication';
import { ContextService } from '@src/service/ContextService';
import { MetadataService } from '@src/service/MetadataService';
import express from 'express';
import { authorize, authorizeAdmin } from '@src/middleware/general/GeneralAuthorization';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';

const metadataRouterLatest = express.Router();
const v = '✓';

metadataRouterLatest.get('/', routeLogger(v), authenticate, authorize, async (req, res) => {
    const context = await ContextService.get(req);
    const metadata = await MetadataService.getAll(context);

    const response: GetAllMetadataResponse = { ...SUCCESS, metadata };
    res.json(response);
});

metadataRouterLatest.post('/', routeLogger(v), authenticate, authorizeAdmin, async (req, res) => {
    const request: CreateMetadataRequest = req.body;
    const metadata = await MetadataService.create(request.key, request.value);

    const response: CreateMetadataResponse = { ...SUCCESS, metadata };
    res.json(response);
});

metadataRouterLatest.post('/update', routeLogger(v), authenticate, authorizeAdmin, async (req, res) => {
    const request: UpdateMetadataRequest = req.body;
    const metadataId = Number(request.id);
    const metadata = await MetadataService.update(metadataId, request.data);

    const response: UpdateMetadataResponse = { ...SUCCESS, metadata };
    res.json(response);
});

metadataRouterLatest.post('/delete/:id', routeLogger(v), authenticate, authorizeAdmin, async (req, res) => {
    const metadataId = Number(req.params.id);
    await MetadataService.delete(metadataId);

    const response = { ...SUCCESS };
    res.json(response);
});

export default metadataRouterLatest;
