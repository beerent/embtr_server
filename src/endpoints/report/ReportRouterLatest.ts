import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { ContextService } from '@src/service/ContextService';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { ReportService } from '@src/service/ReportService';
import { SUCCESS } from '@src/common/RequestResponses';
import { CreateReportRequest } from '@resources/types/requests/ReportTypes';

const reportRouterLatest = express.Router();
const v = '✓';

reportRouterLatest.post('/', routeLogger(v), authenticate, authorize, async (req, res) => {
    const context = await ContextService.get(req);
    const request: CreateReportRequest = req.body;
    ReportService.report(context, request.report.type, request.report.id);

    const response = SUCCESS;
    res.json(response);
});

export default reportRouterLatest;
