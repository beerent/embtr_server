import {
    GetChallengeParticipationResponse,
    GetChallengesResponse,
} from '@resources/types/requests/ChallengeTypes';
import { GetDailyHistoryResponse } from '@resources/types/requests/DailyHistoryTypes';
import { GetHabitJourneyResponse } from '@resources/types/requests/HabitTypes';
import { GetPlannedDayResultSummariesResponse } from '@resources/types/requests/PlannedDayResultTypes';
import {
    GetUserResponse,
    GetUsersResponse,
    UpdateUserRequest,
} from '@resources/types/requests/UserTypes';
import { authenticate, authenticateCreateUser } from '@src/middleware/authentication';
import { validateGetDailyHistory as validateGetUserDailyHistory } from '@src/middleware/daily_history/DailyHistoryValidation';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { validateGetUserData } from '@src/middleware/user_post/UserPostValidation';
import { ChallengeService } from '@src/service/ChallengeService';
import { DailyHistoryService } from '@src/service/DailyHistoryService';
import { HabitJourneyService } from '@src/service/HabitJourneyService';
import { PlannedDayResultService } from '@src/service/PlannedDayResultService';
import { UserPostService } from '@src/service/UserPostService';

import express from 'express';
import { ContextService } from '@src/service/ContextService';
import { User } from '@resources/schema';
import { UserService } from '@src/service/UserService';
import { SUCCESS } from '@src/common/RequestResponses';
import { GetBooleanResponse } from '@resources/types/requests/GeneralTypes';
import { logger } from '@src/common/logger/Logger';

const userRouter = express.Router();

userRouter.get(
    ['/', '/v1/'],
    authenticate,
    runEndpoint(async (req, res) => {
        const newUserContext = await ContextService.getNewUserContext(req);

        const user = await UserService.getCurrent(newUserContext);
        const response: GetUserResponse = { ...SUCCESS, user };
        res.json(response);
    })
);

userRouter.get(
    ['/search/', '/v1/search'],
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const query = req.query.query as string;

        const users: User[] = await UserService.search(context, query);
        const response: GetUsersResponse = { ...SUCCESS, users };
        res.json(response);
    })
);

userRouter.get(
    ['/exists', '/v1/exists'],
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const username = req.query.username as string;

        const exists = await UserService.exists(context, username);
        const response: GetBooleanResponse = { ...SUCCESS, result: exists };
        res.json(response);
    })
);

userRouter.get(
    ['/:uid', '/v1/:uid'],
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const uid = req.params.uid;

        const user = await UserService.get(context, uid);
        const response: GetUserResponse = { ...SUCCESS, user };
        res.json(response);
    })
);

userRouter.get(
    ['/currentUserExists', '/v1/currentUserExists'],
    authenticate,
    runEndpoint(async (req, res) => {
        const newUserContext = await ContextService.getNewUserContext(req);

        const exists = await UserService.currentUserExists(newUserContext);
        logger.info(`currentUserExists: ${exists}`);
        const response: GetBooleanResponse = { ...SUCCESS, result: exists };
        res.json(response);
    })
);

userRouter.post(
    ['/', '/v1/'],
    authenticateCreateUser,
    runEndpoint(async (req, res) => {
        const newUserContext = await ContextService.getNewUserContext(req);
        const createdUser = await UserService.create(newUserContext);

        const response: GetUserResponse = { ...SUCCESS, user: createdUser };
        res.json(response);
    })
);

userRouter.patch(
    ['/setup', '/v1/setup'],
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const requestBody: UpdateUserRequest = req.body;
        const user: User = requestBody.user;

        const setupUser = await UserService.setup(context, user);
        const response: GetUserResponse = { ...SUCCESS, user: setupUser };
        res.json(response);
    })
);

userRouter.patch(
    ['/', '/v1/'],
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const requestBody: UpdateUserRequest = req.body;
        const user: User = requestBody.user;

        const updatedUser = await UserService.update(context, user);
        const response: GetUserResponse = { ...SUCCESS, user: updatedUser };
        res.json(response);
    })
);

/*
 * Daily History
 */
userRouter.get(
    ['/:id/daily-history', '/v1/:id/daily-history'],
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
    ['/:userId/posts', '/v1/:userId/posts'],
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
    ['/:userId/day-results', '/v1/:userId/day-results'],
    authenticate,
    authorize,
    validateGetUserData,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const userId = Number(req.params.userId);

        const plannedDayResultSummaries = await PlannedDayResultService.getAllSummariesForUser(
            context,
            userId
        );
        const response: GetPlannedDayResultSummariesResponse = {
            ...SUCCESS,
            plannedDayResultSummaries,
        };

        res.json(response);
    })
);

/*
 * Habit Journey
 */
userRouter.get(
    ['/:userId/habit-journey', '/v1/:userId/habit-journey'],
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
    ['/:userId/active-challenge-participation', '/v1/:userId/active-challenge-participation'],
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
    ['/:userId/challenge-participation', '/v1/:userId/challenge-participation'],
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
    ['/:userId/completed-challenges', '/v1/:userId/completed-challenges'],
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
