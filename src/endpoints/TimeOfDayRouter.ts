import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { TimeOfDayService } from '@src/service/TimeOfDayService';

const timeOfDayRouter = express.Router();

timeOfDayRouter.get('/', authenticate, authorize, async (req, res) => {
    const response = await TimeOfDayService.getAll();
    res.status(response.httpCode).json(response);
});

export default timeOfDayRouter;
