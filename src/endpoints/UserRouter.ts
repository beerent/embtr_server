import { GetDailyHistoryResponse } from '@resources/types/requests/DailyHistoryTypes';
import { GetUserResponse } from '@resources/types/requests/UserTypes';
import {
    authenticate,
    authenticateCreateUser as authenticateGetCurrentUser,
} from '@src/middleware/authentication';
import { validateGetDailyHistory as validateGetUserDailyHistory } from '@src/middleware/daily_history/DailyHistoryValidation';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { authorizeUserGet } from '@src/middleware/user/UserAuthorization';
import { validateGetUserPosts } from '@src/middleware/user_post/UserPostValidation';
import { DailyHistoryService } from '@src/service/DailyHistoryService';
import { PlannedDayResultService } from '@src/service/PlannedDayResultService';
import { UserPostService } from '@src/service/UserPostService';
import { UserService } from '@src/service/UserService';
import express from 'express';

const userRouter = express.Router();

userRouter.get(
    '/:uid',
    authenticate,
    authorizeUserGet,
    runEndpoint(async (req, res) => {
        const uid = req.params.uid;
        const response: GetUserResponse = await UserService.get(uid);

        res.status(response.httpCode).json(response);
    })
);

userRouter.get(
    '/',
    authenticateGetCurrentUser,
    runEndpoint(async (req, res) => {
        const response: GetUserResponse = await UserService.getCurrentUser(req);

        res.status(response.httpCode).json(response);
    })
);

userRouter.post(
    '/',
    authenticateGetCurrentUser,
    runEndpoint(async (req, res) => {
        const response = await UserService.create(req);
        res.status(response.httpCode).json(response);
    })
);

userRouter.patch(
    '/',
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const response = await UserService.update(req);

        res.status(response.httpCode).json(response);
    })
);

/*
 * Daily History
 */
userRouter.get(
    '/:id/daily-history',
    authenticate,
    authorize,
    validateGetUserDailyHistory,
    runEndpoint(async (req, res) => {
        const response: GetDailyHistoryResponse = await DailyHistoryService.get(req);
        res.status(response.httpCode).json(response);
    })
);

/*
 * User Posts
 */
userRouter.get(
    '/:userId/posts',
    authenticate,
    authorize,
    validateGetUserPosts,
    runEndpoint(async (req, res) => {
        const userId = Number(req.params.userId);
        const response = await UserPostService.getAllForUser(userId);
        res.status(response.httpCode).json(response);
    })
);

/*
 * Planned Day Results
 */
userRouter.get(
    '/:userId/day-results',
    authenticate,
    authorize,
    validateGetUserPosts,
    runEndpoint(async (req, res) => {
        const userId = Number(req.params.userId);
        const response: GetUserResponse = await PlannedDayResultService.getAllForUser(userId);
        res.status(response.httpCode).json(response);
    })
);

export default userRouter;
