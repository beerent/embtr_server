import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import express from 'express';

const marketingRouter = express.Router();

// Parse URL-encoded data for form submissions
marketingRouter.use(express.urlencoded({ extended: true }));

marketingRouter.post(
    '/',
    runEndpoint(async (req, res) => {
        console.log(req.body);
        res.status(200).json('OK');
    })
);

export default marketingRouter;
