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
        const context = await ContextService.get(req);
        await JobService.sendDailyReminders(context);

        res.status(200).send('OK');
    })
);

jobRouterLatest.get(
    '/send-periodic-reminders',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        await JobService.sendPeriodicReminders(context);

        res.status(200).send('OK');
    })
);

jobRouterLatest.get(
    '/send-daily-warnings',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        await JobService.sendDailyWarnings(context);

        res.status(200).send('OK');
    })
);

jobRouterLatest.get(
    '/send-periodic-warnings',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        await JobService.sendPeriodicWarnings(context);

        res.status(200).send('OK');
    })
);

export default jobRouterLatest;
