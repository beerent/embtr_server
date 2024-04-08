import { Context } from '@src/general/auth/Context';
import { ReminderService } from './feature/ReminderService';
import { UserService } from './UserService';

export class JobService {
    public static async dailyReminders(): Promise<void> { }

    public static async sendDailyReminders(context: Context): Promise<void> {
        await ReminderService.sendDailyReminders(context);
    }

    public static async sendPeriodicReminders(context: Context): Promise<void> {
        await ReminderService.sendPeriodicReminders(context);
    }

    public static async sendDailyWarnings(context: Context): Promise<void> {
        await ReminderService.sendDailyWarnings(context);
    }

    public static async sendPeriodicWarnings(context: Context): Promise<void> {
        await ReminderService.sendPeriodicWarnings(context);
    }

    public static async refreshPremiumUsers(context: Context): Promise<void> {
        await UserService.refreshPremiumUsers(context);
    }
}
