import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { UnitService } from '@src/service/UnitService';
import { ContextService } from '@src/service/ContextService';

const unitRouter = express.Router();

unitRouter.get('/', authenticate, authorize, async (req, res) => {
    const context = await ContextService.get(req);

    const units = await UnitService.getAll(context);
    res.json(units);
});

export default unitRouter;
