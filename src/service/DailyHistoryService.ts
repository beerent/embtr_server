import {
    GetDailyHistoryRequest,
    GetDailyHistoryResponse,
} from '@resources/types/requests/DailyHistoryTypes';
import { RESOURCE_NOT_FOUND, SUCCESS } from '@src/common/RequestResponses';
import { DailyHistoryController } from '@src/controller/DailyHistoryController';
import { UserController } from '@src/controller/UserController';
import { Request } from 'express';

export class DailyHistoryService {
    public static async get(request: Request): Promise<GetDailyHistoryResponse> {
        const userId = Number(request.params.id);
        const user = await UserController.getById(userId);
        if (!user) {
            return { ...RESOURCE_NOT_FOUND, message: 'unknown user' };
        }

        const body: GetDailyHistoryRequest = {
            start: new Date(request.query.start as string),
            end: new Date(request.query.end as string),
        };

        const dailyHistory = await DailyHistoryController.get(user.id, body.start, body.end);
        return { ...SUCCESS, dailyHistory };
    }
}
