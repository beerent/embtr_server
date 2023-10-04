import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { DayOfWeekService } from '@src/service/DayOfWeekService';

const dayOfWeekRouter = express.Router();

dayOfWeekRouter.get('/', authenticate, authorize, async (req, res) => {
    const response = await DayOfWeekService.getAll();
    res.status(response.httpCode).json(response);
});

export default dayOfWeekRouter;
