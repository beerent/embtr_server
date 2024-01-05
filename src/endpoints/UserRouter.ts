import {
    GetChallengeParticipationResponse,
    GetChallengesResponse,
} from '@resources/types/requests/ChallengeTypes';
import { GetDailyHistoryResponse } from '@resources/types/requests/DailyHistoryTypes';
import { GetHabitJourneyResponse } from '@resources/types/requests/HabitTypes';
import { GetPlannedDayResultSummariesResponse } from '@resources/types/requests/PlannedDayResultTypes';
import { GetUserResponse, GetUsersResponse } from '@resources/types/requests/UserTypes';
import { UserController } from '@src/controller/UserController';
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

import express from 'express';

const userRouter = express.Router();

userRouter.get(
    '/search',
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const query = req.query.query as string;
        let response = await UserController.search(query);

        res.status(response.httpCode).json(response);
    })
);

userRouter.get(
    '/exists',
    authenticate,
    authorize,
    // todo - add validation
    runEndpoint(async (req, res) => {
        const username = req.query.username as string;
        const response: GetUsersResponse = await UserController.exists(username);

        res.status(response.httpCode).json(response);
    })
);

userRouter.get(
    '/:uid',
    authenticate,
    authorizeUserGet,
    runEndpoint(async (req, res) => {
        const uid = req.params.uid;
        const response: GetUserResponse = await UserController.getByUid(uid);

        res.status(response.httpCode).json(response);
    })
);

userRouter.get(
    '/',
    authenticateGetCurrentUser,
    runEndpoint(async (req, res) => {
        const response: GetUserResponse = await UserController.getCurrentUser(req);
        res.status(response.httpCode).json(response);
    })
);

userRouter.post(
    '/',
    authenticateGetCurrentUser,
    runEndpoint(async (req, res) => {
        const response = await UserController.create(req);
        res.status(response.httpCode).json(response);
    })
);

userRouter.patch(
    '/setup',
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const response = await UserController.setup(req);
        res.status(response.httpCode).json(response);
    })
);

userRouter.patch(
    '/',
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const response = await UserController.update(req);
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
        const response: GetPlannedDayResultSummariesResponse =
            await PlannedDayResultService.getAllSummariesForUser(userId);
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
    '/:userId/active-challenge-participation',
    authenticate,
    authorize,
    validateGetUserData,
    runEndpoint(async (req, res) => {
        const userId = Number(req.params.userId);
        const response: GetChallengeParticipationResponse =
            await ChallengeService.getActiveChallengeParticipationForUser(userId);

        res.status(response.httpCode).json(response);
    })
);

userRouter.get(
    '/:userId/challenge-participation',
    authenticate,
    authorize,
    validateGetUserData,
    runEndpoint(async (req, res) => {
        const userId = Number(req.params.userId);
        const response: GetChallengeParticipationResponse =
            await ChallengeService.getChallengeParticipationForUser(userId);

        res.status(response.httpCode).json(response);
    })
);

userRouter.get(
    '/:userId/completed-challenges',
    authenticate,
    authorize,
    validateGetUserData,
    runEndpoint(async (req, res) => {
        const userId = Number(req.params.userId);
        const response: GetChallengesResponse =
            await ChallengeService.getCompletedChallengesForUser(userId);

        res.status(response.httpCode).json(response);
    })
);

export default userRouter;
