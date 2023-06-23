import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import express from 'express';
import { UnitService } from '@src/service/UnitService';

const unitRouter = express.Router();

unitRouter.get('/', authenticate, authorize, async (req, res) => {
    const response = await UnitService.getAll();
    res.status(response.httpCode).json(response);
});

export default unitRouter;
