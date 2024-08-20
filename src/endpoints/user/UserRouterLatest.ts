import express from 'express';
import { GetChallengeParticipationResponse } from '@resources/types/requests/ChallengeTypes';
import { GetDailyHistoryResponse } from '@resources/types/requests/DailyHistoryTypes';
import { GetHabitJourneyResponse } from '@resources/types/requests/HabitTypes';
import { GetPlannedDayResultSummariesResponse } from '@resources/types/requests/PlannedDayResultTypes';
import {
    CreateBlockUserRequest,
    GetActiveUsersResponse,
    GetUserResponse,
    GetUsersResponse,
    GetUserStatsResponse,
    UpdatePremiumStatusResponse,
    UpdateUserRequest,
} from '@resources/types/requests/UserTypes';
import { authenticate, authenticateCreateUser } from '@src/middleware/authentication';
import { validateGetDailyHistory as validateGetUserDailyHistory } from '@src/middleware/daily_history/DailyHistoryValidation';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize, authorizeAdmin } from '@src/middleware/general/GeneralAuthorization';
import { validateGetUserData } from '@src/middleware/user_post/UserPostValidation';
import { ChallengeService } from '@src/service/ChallengeService';
import { DailyHistoryService } from '@src/service/DailyHistoryService';
import { HabitJourneyService } from '@src/service/HabitJourneyService';
import { PlannedDayResultService } from '@src/service/PlannedDayResultService';
import { UserPostService } from '@src/service/UserPostService';
import { ContextService } from '@src/service/ContextService';
import { ChallengeParticipant, User } from '@resources/schema';
import { UserService } from '@src/service/UserService';
import { SUCCESS } from '@src/common/RequestResponses';
import { GetBooleanResponse } from '@resources/types/requests/GeneralTypes';
import { logger } from '@src/common/logger/Logger';
import { UserValidation } from '@src/validation/UserValidation';
import { PushNotificationTokenService } from '@src/service/PushNotificationTokenService';
import { CreatePushNotificationTokenRequest } from '@resources/types/requests/NotificationTypes';
import { DateUtility } from '@src/utility/date/DateUtility';
import { GetTimelineResponse, TimelineData } from '@resources/types/requests/Timeline';
import { TimelineService } from '@src/service/TimelineService';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { BlockUserService } from '@src/service/BlockUserService';
import userPropertyRouterLatest from './UserPropertyRouterLatest';
import { GetAllUserPostResponse } from '@resources/types/requests/UserPostTypes';
import { PremiumService } from '@src/service/PremiumService';
import { HabitStreakTierService } from '@src/service/HabitStreakTierService';
import { GetUserHabitStreakTierResponse } from '@resources/types/requests/HabitStreakTypes';
import { LevelService } from '@src/service/LevelService';
import { GetLevelDetailsResponse } from '@resources/types/requests/LevelTypes';

const userRouterLatest = express.Router();
const v = '✓';

userRouterLatest.get(
    '/',
    routeLogger(v),
    authenticate,
    runEndpoint(async (req, res) => {
        const newUserContext = await ContextService.getNewUserContext(req);

        const user = await UserService.getCurrent(newUserContext);
        const response: GetUserResponse = { ...SUCCESS, user };
        res.json(response);
    })
);

userRouterLatest.get(
    '/stats',
    routeLogger(v),
    authenticate,
    authorizeAdmin,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);

        const totalUsers = await UserService.getAllUserCount(context);
        const premiumUsers = await UserService.getAllPremiumUserCount(context);

        const response: GetUserStatsResponse = { ...SUCCESS, totalUsers, premiumUsers };
        res.json(response);
    })
);

userRouterLatest.get(
    '/all',
    routeLogger(v),
    authenticate,
    authorizeAdmin,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const query = req.query as Record<string, string>;

        const users: User[] = await UserService.getAll(context, query);
        const response: GetUsersResponse = { ...SUCCESS, users };
        res.json(response);
    })
);

userRouterLatest.get(
    '/search/',
    routeLogger(v),
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

userRouterLatest.get(
    '/admin/search/',
    routeLogger(v),
    authenticate,
    authorizeAdmin,
    runEndpoint(async (req, res) => {
        const query = req.query.query as string;

        const users: User[] = await UserService.adminSearch(query);
        const response: GetUsersResponse = { ...SUCCESS, users };
        res.json(response);
    })
);

userRouterLatest.get(
    '/exists',
    routeLogger(v),
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

userRouterLatest.get(
    '/currentUserExists',
    routeLogger(v),
    authenticate,
    runEndpoint(async (req, res) => {
        const newUserContext = await ContextService.getNewUserContext(req);

        const exists = await UserService.currentUserExists(newUserContext);
        logger.info(`currentUserExists: ${exists}`);
        const response: GetBooleanResponse = { ...SUCCESS, result: exists };
        res.json(response);
    })
);

userRouterLatest.post(
    '/',
    routeLogger(v),
    authenticateCreateUser,
    runEndpoint(async (req, res) => {
        const newUserContext = await ContextService.getNewUserContext(req);

        const createdUser = await UserService.create(newUserContext);
        const response: GetUserResponse = { ...SUCCESS, user: createdUser };
        res.json(response);
    })
);

userRouterLatest.post(
    '/block',
    routeLogger(v),
    authenticate,
    authorize,
    UserValidation.validateCreateBlockUserRequest,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const request: CreateBlockUserRequest = req.body;
        const userId: number = request.userId;

        await BlockUserService.create(context, userId);
        res.json(SUCCESS);
    })
);

userRouterLatest.patch(
    '/setup',
    routeLogger(v),
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

userRouterLatest.patch(
    '/',
    routeLogger(v),
    authenticate,
    authorize,
    //validate me
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const requestBody: UpdateUserRequest = req.body;
        const user: User = requestBody.user;

        const updatedUser = await UserService.update(context, user);
        const response: GetUserResponse = { ...SUCCESS, user: updatedUser };
        res.json(response);
    })
);

userRouterLatest.post(
    '/premium',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.getUserContext(req);

        const user = await UserService.updatePremiumStatus(context);
        const response: UpdatePremiumStatusResponse = { ...SUCCESS, user };
        res.json(response);
    })
);

userRouterLatest.post(
    '/premiumPressed',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const source = req.query.source as string;

        await PremiumService.premiumPressed(context, source);
        res.json(SUCCESS);
    })
);

/*
 * Daily History
 */

/**
 * @deprecated on version 2.0.14 (use habitStreakRouter)
 */
userRouterLatest.get(
    '/:id/daily-history',
    routeLogger(v),
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
// TODO: Add optional limit
userRouterLatest.get(
    '/:userId/posts',
    routeLogger(v),
    authenticate,
    authorize,
    validateGetUserData,
    runEndpoint(async (req, res) => {
        const userId = Number(req.params.userId);
        const userPosts = await UserPostService.getAllForUser(userId);

        const response: GetAllUserPostResponse = { ...SUCCESS, userPosts };
        res.status(response.httpCode).json(response);
    })
);

userRouterLatest.get(
    '/:userId/timeline-posts',
    routeLogger(v),
    authenticate,
    authorize,
    /*validate, */ async (req, res) => {
        const userId = Number(req.params.userId);
        const context = await ContextService.get(req);
        const cursor: Date = DateUtility.getOptionalDate(req.query.cursor as string);
        const limit: number | undefined = req.query.limit
            ? Number(req.query.limit as string)
            : undefined;

        const timelineData: TimelineData = await TimelineService.getUserPostsForUser(
            context,
            userId,
            cursor,
            limit
        );
        const response: GetTimelineResponse = { ...SUCCESS, timelineData };
        res.json(response);
    }
);

/*
 * Planned Day Results
 */
// TODO: Add optional limit
userRouterLatest.get(
    '/:userId/day-results',
    routeLogger(v),
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

userRouterLatest.get(
    '/:userId/timeline-day-results',
    routeLogger(v),
    authenticate,
    authorize,
    UserValidation.validateTimelineDayResultsRequest,
    async (req, res) => {
        const userId = Number(req.params.userId);
        const context = await ContextService.get(req);
        const cursor: Date = DateUtility.getOptionalDate(req.query.cursor as string);
        const limit: number | undefined = req.query.limit
            ? Number(req.query.limit as string)
            : undefined;

        const timelineData: TimelineData = await TimelineService.getPlannedDayResultForUser(
            context,
            userId,
            cursor,
            limit
        );
        const response: GetTimelineResponse = { ...SUCCESS, timelineData };
        res.json(response);
    }
);

/*
 * Habit Journey
 */
userRouterLatest.get(
    '/:userId/habit-journey',
    routeLogger(v),
    authenticate,
    authorize,
    validateGetUserData,
    runEndpoint(async (req, res) => {
        const userId = Number(req.params.userId);
        const response: GetHabitJourneyResponse = await HabitJourneyService.get(userId);

        res.status(response.httpCode).json(response);
    })
);

userRouterLatest.get(
    '/:userId/habit-streak',
    routeLogger(v),
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
userRouterLatest.get(
    '/:userId/active-challenge-participation',
    routeLogger(v),
    authenticate,
    authorize,
    validateGetUserData,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const userId = Number(req.params.userId);

        const participation: ChallengeParticipant[] =
            await ChallengeService.getActiveChallengeParticipationForUser(context, userId);
        const response: GetChallengeParticipationResponse = {
            ...SUCCESS,
            challengeParticipation: participation,
        };

        res.status(response.httpCode).json(response);
    })
);

userRouterLatest.get(
    '/:userId/challenge-participation',
    routeLogger(v),
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

userRouterLatest.get(
    '/:userId/completed-challenges',
    routeLogger(v),
    authenticate,
    authorize,
    validateGetUserData,
    runEndpoint(async (req, res) => {
        const userId = Number(req.params.userId);
        const challengeParticipation = await ChallengeService.getCompletedChallengesForUser(userId);

        const response: GetChallengeParticipationResponse = {
            ...SUCCESS,
            challengeParticipation,
        };

        res.status(response.httpCode).json(response);
    })
);

userRouterLatest.get(
    '/:userId/level',
    routeLogger(v),
    authenticate,
    authorize,
    validateGetUserData,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const userId = Number(req.params.userId);
        const levelDetails = await LevelService.getDetails(context, userId);

        const response: GetLevelDetailsResponse = {
            ...SUCCESS,
            levelDetails,
        };

        res.status(response.httpCode).json(response);
    })
);

userRouterLatest.post(
    '/createPushNotificationToken/',
    routeLogger(v),
    authenticate,
    UserValidation.validateRegisterPushNotificationRequest,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const requestBody: CreatePushNotificationTokenRequest = req.body;
        const token = requestBody.token;

        await PushNotificationTokenService.register(context, token);
        res.status(200).json(SUCCESS);
    })
);

userRouterLatest.get(
    '/:userId/habit-streak-tier',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);

        const userId = Number(req.params.userId);
        const userHabitStreakTier = await HabitStreakTierService.getForUser(context, userId);
        const response: GetUserHabitStreakTierResponse = { ...SUCCESS, userHabitStreakTier };

        res.json(response);
    })
);

/*
 * THIS NEEDS TO BE AT THE BOTTOM
 */

/* by all numberic id */
userRouterLatest.get(
    '/:id(\\d+)',
    routeLogger(v),
    authenticate,
    authorizeAdmin,
    runEndpoint(async (req, res) => {
        const id = parseInt(req.params.id);
        const user = await UserService.getByIdForAdmin(id);
        const response: GetUserResponse = { ...SUCCESS, user };
        res.json(response);
    })
);

/* by all alphanumeric id */
userRouterLatest.get(
    '/:uid([a-zA-Z0-9]+)',
    routeLogger(v),
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

userRouterLatest.get(
    '/admin/active-users/:startDate/:endDate',
    routeLogger(v),
    authenticate,
    authorizeAdmin,
    runEndpoint(async (req, res) => {
        const startDate = new Date(parseInt(req.params.startDate));
        const endDate = new Date(parseInt(req.params.endDate));

        const activeUsers = await UserService.getActiveUsersForRange(startDate, endDate);

        const response: GetActiveUsersResponse = {
            ...SUCCESS,
            activeUsers,
        };

        res.json(response);
    })
);

userRouterLatest.use('/property', userPropertyRouterLatest);

export default userRouterLatest;
