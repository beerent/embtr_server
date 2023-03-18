import { CreateDayResultRequest, GetDayResultRequest } from '@resources/types/DayResultTypes';
import { GetUserResponse } from '@resources/types/UserTypes';
import { authenticate } from '@src/middleware/authentication';
import { authorizeGet, authorizePost } from '@src/middleware/day_result/DayResultAuthorization';
import { validateGetById, validateGetByUser, validatePost } from '@src/middleware/day_result/DayResultValidation';
import { DayResultService } from '@src/service/DayResultService';
import express from 'express';

const dayResultRouter = express.Router();

dayResultRouter.get('/', authenticate, authorizeGet, async (req, res) => {
    const response: GetUserResponse = await DayResultService.getAll();
    res.status(response.httpCode).json(response);
});

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

dayResultRouter.post('/', authenticate, authorizePost, validatePost, async (req, res) => {
    const request: CreateDayResultRequest = {
        plannedDayId: req.body.plannedDayId,
    };
    const response = await DayResultService.create(request);
    res.status(response.httpCode).json(response);
});

export default dayResultRouter;
