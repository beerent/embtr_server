import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { AdminService } from '@src/service/AdminService';
import express from 'express';

const adminRouterV1 = express.Router();
const v = 'v1';

adminRouterV1.get(
    '/database-ping',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        await AdminService.databasePing();
        res.status(200).send('OK');
    })
);

adminRouterV1.get(
    '/ping',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        await AdminService.ping();
        res.status(200).send('OK');
    })
);

export default adminRouterV1;
