import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { ContextService } from '@src/service/ContextService';
import { JobService } from '@src/service/JobService';
import express from 'express';

const jobRouterLatest = express.Router();
const v = '✓';

jobRouterLatest.get(
    '/periodic-reminders',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        await JobService.sendPeriodicReminders(context);

        res.status(200).send('OK');
    })
);

export default jobRouterLatest;
