import { UserMilestoneDao } from '@src/database/UserMilestoneDao';
import { Context } from '@src/general/auth/Context';

export class UserMilestoneService {
    public static async clearForPlannedDay(context: Context, plannedDayId: number) {
        await UserMilestoneDao.deleteForPlannedDay(context.userId, plannedDayId);
    }
}
