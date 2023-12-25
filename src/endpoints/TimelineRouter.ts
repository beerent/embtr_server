import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { TimelineService } from '@src/service/TimelineService';

const timelineRouter = express.Router();

timelineRouter.get(
    '/',
    authenticate,
    authorize,
    /*validate, */ async (req, res) => {
        const response = await TimelineService.get(req);
        res.status(response.httpCode).json(response);
    }
);

export default timelineRouter;
