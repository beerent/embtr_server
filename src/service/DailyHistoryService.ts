import {
    GetDailyHistoryRequest,
    GetDailyHistoryResponse,
} from '@resources/types/requests/DailyHistoryTypes';
import { RESOURCE_NOT_FOUND, SUCCESS } from '@src/common/RequestResponses';
import { DailyHistoryDao } from '@src/database/DailyHistoryDao';
import { UserDao } from '@src/database/UserDao';
import { Request } from 'express';

export class DailyHistoryService {
    public static async get(request: Request): Promise<GetDailyHistoryResponse> {
        const userId = Number(request.params.id);
        const user = await UserDao.getById(userId);
        if (!user) {
            return { ...RESOURCE_NOT_FOUND, message: 'unknown user' };
        }

        const body: GetDailyHistoryRequest = {
            start: new Date(request.query.start as string),
            end: new Date(request.query.end as string),
        };

        // add one to end date
        body.end.setDate(body.end.getDate() + 1);

        const dailyHistory = await DailyHistoryDao.get(user.id, body.start, body.end);
        return { ...SUCCESS, dailyHistory };
    }
}
