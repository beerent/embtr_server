import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize, authorizeAdmin } from '@src/middleware/general/GeneralAuthorization';
import { UnitService } from '@src/service/UnitService';
import { ContextService } from '@src/service/ContextService';
import { CreateUnitRequest, CreateUnitResponse, DeleteUnitRequest, GetUnitsResponse, UpdateUnitRequest, UpdateUnitResponse } from '@resources/types/requests/UnitTypes';
import { SUCCESS } from '@src/common/RequestResponses';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';

const unitRouterLatest = express.Router();
const v = '✓';

unitRouterLatest.get('/', routeLogger(v), authenticate, authorize, async (req, res) => {
    const context = await ContextService.get(req);

    const units = await UnitService.getAll(context);
    const response: GetUnitsResponse = {
        ...SUCCESS,
        units,
    };
    res.json(response);
});

unitRouterLatest.post('/', routeLogger(v), authenticate, authorizeAdmin, async (req, res) => {
    const request: CreateUnitRequest = req.body;
    const unit = await UnitService.create(request);

    const response: CreateUnitResponse = {
        ...SUCCESS,
        unit
    };

    res.json(response);
});

unitRouterLatest.post('/update', routeLogger(v), authenticate, authorizeAdmin, async (req, res) => {
    const request: UpdateUnitRequest = req.body;
    const unit = await UnitService.update(parseInt(request.id), request.data);

    const response: UpdateUnitResponse = {
        ...SUCCESS,
        unit
    };

    res.json(response);
});

unitRouterLatest.post('/delete', routeLogger(v), authenticate, authorizeAdmin, async (req, res) => {
    const request: DeleteUnitRequest = req.body;
    const response = await UnitService.delete(parseInt(request.id));
    res.status(response.httpCode).json(response);
});

export default unitRouterLatest;
