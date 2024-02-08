import { Context } from '@src/general/auth/Context';
import { EmailDao } from '@src/database/EmailDao';

export class ReportService {
    public static async report(context: Context, type: string, id: number) {
        const body = `${context.userEmail} [${context.userId}] has reported ${type}-${id}`;
        await EmailDao.sendEmail('support@embtr.com', 'Incident Reported', body);
    }
}
