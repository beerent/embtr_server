import { Context } from '@src/general/auth/Context';
import { ReminderService } from './feature/ReminderService';

export class JobService {
    public static async dailyReminders(): Promise<void> { }

    public static async sendPeriodicReminders(context: Context): Promise<void> {
        await ReminderService.sendPeriodicReminders(context);
    }
}
