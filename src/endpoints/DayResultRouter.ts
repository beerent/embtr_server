import { GetDayResultRequest } from '@resources/types/DayResultTypes';
import { GetUserResponse } from '@resources/types/UserTypes';
import { authenticate } from '@src/middleware/authentication';
import { authorizeGet } from '@src/middleware/day_result/DayResultAuthorization';
import { validateGetById, validateGetByUser } from '@src/middleware/day_result/DayResultValidation';
import { DayResultService } from '@src/service/DayResultService';
import express from 'express';

const dayResultRouter = express.Router();

dayResultRouter.get('/:id', authenticate, authorizeGet, validateGetById, async (req, res) => {
    const id = Number(req.params.id);
    const response: GetUserResponse = await DayResultService.getById(id);

    res.status(response.httpCode).json(response);
});

dayResultRouter.get('/:userId/:dayKey', authenticate, authorizeGet, validateGetByUser, async (req, res) => {
    const request: GetDayResultRequest = {
        userId: Number(req.params.userId),
        dayKey: req.params.dayKey,
    };

    const response: GetUserResponse = await DayResultService.getByUserAndDayKey(request);

    res.status(response.httpCode).json(response);
});

export default dayResultRouter;
