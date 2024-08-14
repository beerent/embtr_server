import express, { NextFunction, Request, Response } from 'express';
import { ClientVersionUtil } from '@src/utility/ClientVersionUtil';
import '@src/event/event_listener_imports';
import { WebSocketService } from './service/WebSocketService';
import http from 'http';
import bodyParser from 'body-parser';
import userRouter from './endpoints/user/UserRouter';
import { logger } from './common/logger/Logger';
import { handleError } from './middleware/error/ErrorMiddleware';
import habitRouter from '@src/endpoints/habit/HabitRouter';
import accountRouter from './endpoints/account/AccountRouter';
import plannedDayRouter from './endpoints/planned_day/PlannedDayRouter';
import plannedDayResultRouter from '@src/endpoints/planned_day_result/PlannedDayResultRouter';
import userPostRouter from '@src/endpoints/user_post/UserPostRouter';
import notificationRouter from '@src/endpoints/notification/NotificationRouter';
import metadataRouter from '@src/endpoints/metadata/MetadataRouter';
import plannedHabitRouter from '@src/endpoints/planned-habit/PlannedHabitRouter';
import quoteOfTheDayRouter from '@src/endpoints/quote_of_the_day/QuoteOfTheDayRouter';
import unitRouter from '@src/endpoints/unit/UnitRouter';
import timeOfTheDayRouter from '@src/endpoints/time_of_the_day/TimeOfTheDayRouter';
import dayOfTheWeekRouter from '@src/endpoints/day_of_week/DayOfTheWeekRouter';
import marketingRouter from '@src/endpoints/marketing/MarketingRouter';
import timelineRouter from '@src/endpoints/timeline/TimelineRouter';
import healthRouter from '@src/endpoints/health/HealthRouter';
import reportRouter from './endpoints/report/ReportRouter';
import scheduledHabitRouter from './endpoints/scheduled_habit/ScheduledHabitRouter';
import habitStreakRouter from './endpoints/habit_streak/HabitStreakRouter';
import newUserRouter from './endpoints/new_user/NewUserRouter';
import jobRouter from './endpoints/job/JobRouter';
import challengeRouter from './endpoints/challenge/ChallengeRouter';
import iconRouter from './endpoints/icon/IconRouter';
import milestoneRouter from './endpoints/milestone/MilestoneRouter';
import iconCategoryRouter from './endpoints/iconCategory/IconCategoryRouter';
import tagRouter from './endpoints/tag/TagRouter';
import premiumRouter from './endpoints/premium_router/PremiumRouter';
import badgeRouter from './endpoints/badge/BadgeRouter';
import levelRouter from './endpoints/level/LevelRouter';
import pointRouter from './endpoints/point/PointRouter';
import leaderboardRouter from './endpoints/leaderboard/LeaderboardRouter';
import featureRouter from './endpoints/feature/FeatureRouter';
import featuredPostRouter from './endpoints/featured_post/FeaturedPostRouter';

//  In the realm of code, where logic intertwines, Between "why" and "how," a programmer defines. From cryptic syntax to elegant design, The journey unfolds, a quest for the sublime. In lines of code, creation sparks and shines.
//
//  - definitelynot_chad - 2024-04-12

//  I just shit my pants - loganmbutler - 2024-07-11

const cors = require('cors');

const app = express();
const server = http.createServer(app);
WebSocketService.init(server);

const allowedOrigins = [
    'https://www.embtr.com',
    'https://embtr.com',
    'https://app.embtr.com',
    'http://localhost:19006',
    'https://admin.embtr.com',
];
app.use(
    cors({
        origin: allowedOrigins,
    })
);

app.use(bodyParser.json());

const versionUrlMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const clientMajorVersion = ClientVersionUtil.getMajorClientVersion(req);
    const urlHasVersion = req.url.match(/\/v[0-9]+\//);

    if (clientMajorVersion != undefined && clientMajorVersion >= 0 && !urlHasVersion) {
        req.url = `/v${clientMajorVersion}${req.url}`;
    }

    next();
};

app.use(versionUrlMiddleware);

app.use('/', habitRouter);
app.use('/', scheduledHabitRouter);
app.use('/', userRouter);
app.use('/', accountRouter);
app.use('/', plannedDayRouter);
app.use('/', plannedDayResultRouter);
app.use('/', userPostRouter);
app.use('/', notificationRouter);
app.use('/', metadataRouter);
app.use('/', plannedHabitRouter);
app.use('/', quoteOfTheDayRouter);
app.use('/', unitRouter);
app.use('/', timeOfTheDayRouter);
app.use('/', dayOfTheWeekRouter);
app.use('/', marketingRouter);
app.use('/', timelineRouter);
app.use('/', reportRouter);
app.use('/', habitStreakRouter);
app.use('/', levelRouter);
app.use('/', newUserRouter);
app.use('/', healthRouter);
app.use('/', jobRouter);
app.use('/', challengeRouter);
app.use('/', iconRouter);
app.use('/', iconCategoryRouter);
app.use('/', tagRouter);
app.use('/', milestoneRouter);
app.use('/', premiumRouter);
app.use('/', badgeRouter);
app.use('/', pointRouter);
app.use('/', leaderboardRouter);
app.use('/', featureRouter);
app.use('/', featuredPostRouter);
app.use('/', healthRouter);

app.use(handleError);

app.use((req, res, next) => {
    logger.warn(`Unhandled endpoint: ${req.method} ${req.baseUrl}${req.path}`);
    next();
});

// ###############################
// # ENDPOINT GRAVEYARD (R.I.P.) #
// ###############################
//app.use('/widget', widgetRouterV1);

export default server;
