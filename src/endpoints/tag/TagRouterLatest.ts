import { authenticate } from '@src/middleware/authentication';
import { authorize, authorizeAdmin } from '@src/middleware/general/GeneralAuthorization';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { SUCCESS } from '@src/common/RequestResponses';
import express from 'express';
import { TagService } from '@src/service/TagService';
import { GetTagsResponse } from '@resources/types/requests/TagTypes';
import { ContextService } from '@src/service/ContextService';
import { Constants } from '@resources/types/constants/constants';

const tagRouterLatest = express.Router();
const v = '✓';

tagRouterLatest.get('/all', routeLogger(v), authenticate, authorizeAdmin, async (req, res) => {
    const tags = await TagService.getAll();
    const response: GetTagsResponse = { ...SUCCESS, tags };

    res.json(response);
});

tagRouterLatest.get('/:category', routeLogger(v), authenticate, authorize, async (req, res) => {
    const context = await ContextService.getUserContext(req);
    const categoryString = req.params.category;
    const category = Constants.getTagCategory(categoryString);

    const tags = await TagService.getAllByCategory(context, category);
    const response: GetTagsResponse = { ...SUCCESS, tags };

    res.json(response);
});

export default tagRouterLatest;
