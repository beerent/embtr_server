import { Widget } from '@resources/schema';
import { Response } from '@resources/types/requests/RequestTypes';
import { GetWidgetsResponse, UpdateWidgetsRequest } from '@resources/types/requests/WidgetTypes';
import { SUCCESS } from '@src/common/RequestResponses';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { WidgetController } from '@src/controller/WidgetController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Request } from 'express';

export class WidgetService {
    public static async getUserWidgets(request: Request): Promise<GetWidgetsResponse> {
        const userId: number = (await AuthorizationController.getUserIdFromToken(request.headers.authorization!)) as number;
        const widgets = await WidgetController.getAllForUser(userId);
        //const widgetModels: Widget[] = ModelConverter.convertAll(widgets);

        return { ...SUCCESS, widgets: [] };
    }

    public static async updateWidgets(request: Request): Promise<Response> {
        const userId: number = (await AuthorizationController.getUserIdFromToken(request.headers.authorization!)) as number;
        const body: UpdateWidgetsRequest = request.body;
        await WidgetController.upsertAllForUser(userId, body.widgets);

        return SUCCESS;
    }
}
