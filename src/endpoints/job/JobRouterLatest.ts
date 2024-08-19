import { logger } from '@src/common/logger/Logger';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { ContextService } from '@src/service/ContextService';
import { JobService } from '@src/service/JobService';
import express from 'express';

const jobRouterLatest = express.Router();
const v = '✓';

jobRouterLatest.get(
    '/send-daily-reminders',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        const context = await ContextService.getJobContext(req);
        await JobService.sendDailyReminders(context);

        res.status(200).send('OK');
    })
);

jobRouterLatest.get(
    '/send-periodic-reminders',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        const context = await ContextService.getJobContext(req);
        await JobService.sendPeriodicReminders(context);

        res.status(200).send('OK');
    })
);

jobRouterLatest.get(
    '/send-daily-warnings',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        const context = await ContextService.getJobContext(req);
        await JobService.sendDailyWarnings(context);

        res.status(200).send('OK');
    })
);

jobRouterLatest.get(
    '/send-periodic-warnings',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        const context = await ContextService.getJobContext(req);
        await JobService.sendPeriodicWarnings(context);

        res.status(200).send('OK');
    })
);

jobRouterLatest.get(
    '/refresh-premium-users',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        const context = await ContextService.getJobContext(req);
        await JobService.refreshPremiumUsers(context);

        res.status(200).send('OK');
    })
);

jobRouterLatest.get(
    '/refresh-new-users',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        const context = await ContextService.getJobContext(req);
        await JobService.refreshNewUsers(context);

        res.status(200).send('OK');
    })
);

jobRouterLatest.get(
    '/refresh-away-mode',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        logger.info('JOB - Refreshing away mode');
        const context = await ContextService.getJobContext(req);
        await JobService.refreshAwayMode(context);

        res.status(200).send('OK');
    })
);

jobRouterLatest.get(
    '/notify-lurking-users',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        logger.info('JOB - Notify users with no scheduled habits');
        const context = await ContextService.getJobContext(req);
        await JobService.sendRetentionNotificationToUsersWithNoScheduledHabits(context);

        res.status(200).send('OK');
    })
);

jobRouterLatest.get(
    '/notify-stale-users',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        logger.info('JOB - Notify users with all expired scheduled habits');
        const context = await ContextService.getJobContext(req);
        await JobService.sendRetentionNotificationToUsersWithAllExpiredScheduledHabits(context);

        res.status(200).send('OK');
    })
);

jobRouterLatest.get(
    '/notify-inactive-users',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        logger.info('JOB - Notify inactive users with scheduled habits');
        const context = await ContextService.getJobContext(req);
        await JobService.sendRetentionNotificationToInactiveUsersWithScheduledHabits(context);

        res.status(200).send('OK');
    })
);

jobRouterLatest.get(
    '/process-pending-push-notifications',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        logger.info('JOB - Process pending push notifications');
        const context = await ContextService.getJobContext(req);
        await JobService.processPendingPushNotifications(context);

        res.status(200).send('OK');
    })
);

export default jobRouterLatest;
