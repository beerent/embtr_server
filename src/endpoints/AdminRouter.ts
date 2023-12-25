import { AdminController } from '@src/controller/custom/AdminController';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { MarketingService } from '@src/service/MarketingService';
import express from 'express';

const adminRouter = express.Router();

adminRouter.get(
    '/ping',
    runEndpoint(async (req, res) => {
        await AdminController.ping();
        res.status(200).send('OK');
    })
);

export default adminRouter;

