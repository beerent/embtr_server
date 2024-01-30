import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { MarketingService } from '@src/service/MarketingService';
import express from 'express';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';

const marketingRouterV1 = express.Router();
const v = 'v1';

// convert web form data to json
marketingRouterV1.use(express.urlencoded({ extended: true }));

marketingRouterV1.post(
    '/',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        const email = req.body['email-address'];
        const result = await MarketingService.register(email);

        res.status(result.httpCode).json(result);
    })
);

export default marketingRouterV1;
