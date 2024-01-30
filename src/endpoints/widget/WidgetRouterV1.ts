import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { validateUpdateUserWidgets } from '@src/middleware/widget/WidgetValidation';
import { WidgetService } from '@src/service/WidgetService';
import express from 'express';

const widgetRouterV1 = express.Router();

widgetRouterV1.post('/', authenticate, authorize, validateUpdateUserWidgets, async (req, res) => {
    const response = await WidgetService.updateWidgets(req);
    res.status(response.httpCode).json(response);
});

widgetRouterV1.get('/', authenticate, authorize, async (req, res) => {
    const response = await WidgetService.getUserWidgets(req);
    res.status(response.httpCode).json(response);
});

export default widgetRouterV1;
