import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { MarketingService } from '@src/service/MarketingService';
import express from 'express';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';

const marketingRouterLatest = express.Router();
const v = '✓';

// convert web form data to json
marketingRouterLatest.use(express.urlencoded({ extended: true }));

marketingRouterLatest.post(
    '/',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        const email = req.body['email-address'];
        const result = await MarketingService.register(email);

        res.status(result.httpCode).json(result);
    })
);

export default marketingRouterLatest;
