import { GetDailyHistoryResponse } from '@resources/types/requests/DailyHistoryTypes';
import { authenticate } from '@src/middleware/authentication';
import { validateGetDailyHistory } from '@src/middleware/daily_history/DailyHistoryValidation';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { DailyHistoryService } from '@src/service/DailyHistoryService';
import express from 'express';

const dailyHistoryRouter = express.Router();

dailyHistoryRouter.get('/:id/daily-history', authenticate, authorize, validateGetDailyHistory, async (req, res) => {
    const response: GetDailyHistoryResponse = await DailyHistoryService.get(req);
    res.status(response.httpCode).json(response);
});

export default dailyHistoryRouter;
