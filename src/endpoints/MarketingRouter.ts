import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { MarketingService } from '@src/service/MarketingService';
import express from 'express';

const marketingRouter = express.Router();

// convert web form data to json
marketingRouter.use(express.urlencoded({ extended: true }));

marketingRouter.post(
    '/v1/',
    runEndpoint(async (req, res) => {
        const email = req.body['email-address'];
        const result = await MarketingService.register(email);

        res.status(result.httpCode).json(result);
    })
);

export default marketingRouter;
