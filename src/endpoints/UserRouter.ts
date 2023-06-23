import { GetChallengesResponse } from '@resources/types/requests/ChallengeTypes';
import { GetDailyHistoryResponse } from '@resources/types/requests/DailyHistoryTypes';
import { GetHabitJourneyResponse } from '@resources/types/requests/HabitTypes';
import { GetUserResponse, GetUsersResponse } from '@resources/types/requests/UserTypes';
import {
    authenticate,
    authenticateCreateUser as authenticateGetCurrentUser,
} from '@src/middleware/authentication';
import { validateGetDailyHistory as validateGetUserDailyHistory } from '@src/middleware/daily_history/DailyHistoryValidation';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { authorizeUserGet } from '@src/middleware/user/UserAuthorization';
import { validateGetUserData } from '@src/middleware/user_post/UserPostValidation';
import { ChallengeService } from '@src/service/ChallengeService';
import { DailyHistoryService } from '@src/service/DailyHistoryService';
import { HabitJourneyService } from '@src/service/HabitJourneyService';
import { PlannedDayResultService } from '@src/service/PlannedDayResultService';
import { UserPostService } from '@src/service/UserPostService';
import { UserService } from '@src/service/UserService';
import express from 'express';

const userRouter = express.Router();

userRouter.get(
    '/search',
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const query = req.query.query as string;
        const response: GetUsersResponse = await UserService.search(query);

        res.status(response.httpCode).json(response);
    })
);

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
    validateGetUserData,
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
    validateGetUserData,
    runEndpoint(async (req, res) => {
        const userId = Number(req.params.userId);
        const response: GetUserResponse = await PlannedDayResultService.getAllForUser(userId);
        res.status(response.httpCode).json(response);
    })
);

/*
 * Habit Journey
 */
userRouter.get(
    '/:userId/habit-journey',
    authenticate,
    authorize,
    validateGetUserData,
    runEndpoint(async (req, res) => {
        const userId = Number(req.params.userId);
        const response: GetHabitJourneyResponse = await HabitJourneyService.get(userId);

        res.status(response.httpCode).json(response);
    })
);

/*
 * Challenges
 */
userRouter.get(
    '/:userId/challenges',
    authenticate,
    authorize,
    validateGetUserData,
    runEndpoint(async (req, res) => {
        const userId = Number(req.params.userId);
        const response: GetChallengesResponse = await ChallengeService.getAllForUser(userId);

        res.status(response.httpCode).json(response);
    })
);

export default userRouter;
