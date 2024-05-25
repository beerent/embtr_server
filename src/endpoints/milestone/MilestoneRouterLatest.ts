import express from 'express';
import { authenticate } from "@src/middleware/authentication";
import { authorizeAdmin } from "@src/middleware/general/GeneralAuthorization";
import { routeLogger } from "@src/middleware/logging/LoggingMiddleware";
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { MilestoneService } from '@src/service/MilestoneService';
import { GetMilestonesResponse } from '@resources/types/requests/MilestoneTypes';
import { SUCCESS } from '@src/common/RequestResponses';

const milestoneRouterLatest = express.Router();
const v = '✓';

milestoneRouterLatest.get(
    '/',
    routeLogger(v),
    authenticate,
    authorizeAdmin, 
    runEndpoint(async (req, res) => {
        const milestones = await MilestoneService.getAll()

        const response: GetMilestonesResponse = { ...SUCCESS, milestones };
        res.json(response);
    })
);

export default milestoneRouterLatest;

