import { GetDailyHistoryResponse } from '@resources/types/requests/DailyHistoryTypes';
import { GetUserResponse, UpdateUserRequest } from '@resources/types/requests/UserTypes';
import { authenticate } from '@src/middleware/authentication';
import { validateGetDailyHistory } from '@src/middleware/daily_history/DailyHistoryValidation';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { authorizeUserGet } from '@src/middleware/user/UserAuthorization';
import { DailyHistoryService } from '@src/service/DailyHistoryService';
import { UserService } from '@src/service/UserService';
import express from 'express';

const userRouter = express.Router();

userRouter.get('/:uid', authenticate, authorizeUserGet, async (req, res) => {
    const uid = req.params.uid;
    const response: GetUserResponse = await UserService.get(uid);

    res.status(response.httpCode).json(response);
});

userRouter.post('/', authenticate, async (req, res) => {
    const response = await UserService.create(req);
    res.status(response.httpCode).json(response);
});

userRouter.patch('/', authenticate, authorize, async (req, res) => {
    const response = await UserService.update(req);

    res.status(response.httpCode).json(response);
});

userRouter.get('/:id/daily-history', authenticate, authorize, validateGetDailyHistory, async (req, res) => {
    const response: GetDailyHistoryResponse = await DailyHistoryService.get(req);
    res.status(response.httpCode).json(response);
});

export default userRouter;
