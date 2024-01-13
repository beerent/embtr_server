import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { TimeOfDayService } from '@src/service/TimeOfDayService';
import { ContextService } from '@src/service/ContextService';
import { TimeOfDay } from '@resources/schema';
import { GetTimesOfDayResponse } from '@resources/types/requests/TimeOfDayTypes';
import { SUCCESS } from '@src/common/RequestResponses';

const timeOfDayRouter = express.Router();

timeOfDayRouter.get('/v1/', authenticate, authorize, async (req, res) => {
    const context = await ContextService.get(req);

    const timesOfDay: TimeOfDay[] = await TimeOfDayService.getAll(context);
    const response: GetTimesOfDayResponse = { ...SUCCESS, timesOfDay };
    res.json(response);
});

export default timeOfDayRouter;
