import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { UnitService } from '@src/service/UnitService';
import { ContextService } from '@src/service/ContextService';
import { GetUnitsResponse } from '@resources/types/requests/UnitTypes';
import { SUCCESS } from '@src/common/RequestResponses';

const unitRouter = express.Router();

unitRouter.get(['/', '/v1/'], authenticate, authorize, async (req, res) => {
    const context = await ContextService.get(req);

    const units = await UnitService.getAll(context);
    const response: GetUnitsResponse = {
        ...SUCCESS,
        units,
    };
    res.json(response);
});

export default unitRouter;
