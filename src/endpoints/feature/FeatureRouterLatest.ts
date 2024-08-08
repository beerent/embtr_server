import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { ContextService } from '@src/service/ContextService';
import { SUCCESS } from '@src/common/RequestResponses';
import { FeatureService } from '@src/service/FeatureService';
import {
    GetDetailedFeatureResponse,
    GetFeatureResponse,
    GetFeaturesResponse,
} from '@resources/types/requests/FeatureTypes';

const featureRouterLatest = express.Router();
const v = '✓';

featureRouterLatest.get('/', routeLogger(v), authenticate, authorize, async (req, res) => {
    const context = await ContextService.get(req);

    const features = await FeatureService.getAll(context);
    const response: GetFeaturesResponse = { ...SUCCESS, features: features };

    res.json(response);
});

featureRouterLatest.get('/detailed', routeLogger(v), authenticate, authorize, async (req, res) => {
    const context = await ContextService.get(req);

    const detailedFeatures = await FeatureService.getAllDetailed(context);
    const response: GetDetailedFeatureResponse = { ...SUCCESS, detailedFeatures: detailedFeatures };

    res.json(response);
});

featureRouterLatest.get('/vote', routeLogger(v), authenticate, authorize, async (req, res) => {
    const context = await ContextService.get(req);

    const feature = await FeatureService.getUserVote(context);
    const response: GetFeatureResponse = { ...SUCCESS, feature };

    res.json(response);
});

featureRouterLatest.post('/:id/vote', routeLogger(v), authenticate, authorize, async (req, res) => {
    const context = await ContextService.get(req);

    const featureId = parseInt(req.params.id);
    await FeatureService.vote(context, featureId);

    res.json(SUCCESS);
});

export default featureRouterLatest;
