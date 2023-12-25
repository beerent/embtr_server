import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { AdminService } from '@src/service/AdminService';
import express from 'express';

const adminRouter = express.Router();

adminRouter.get(
    '/database-ping',
    runEndpoint(async (req, res) => {
        await AdminService.databasePing();
        res.status(200).send('OK');
    })
);

adminRouter.get(
    '/ping',
    runEndpoint(async (req, res) => {
        await AdminService.ping();
        res.status(200).send('OK');
    })
);

export default adminRouter;

