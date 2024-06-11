import { Context } from '@src/general/auth/Context';
import { Role } from '@src/roles/Roles';
import { ApiAlertsService } from '../ApiAlertsService';
import { UserRoleService } from '../UserRoleService';
import { UserPropertyService } from '@src/service/UserPropertyService';
import { UserService } from '../UserService';
import { Constants } from '@resources/types/constants/constants';

export class PremiumMembershipService {
    public static async addPremium(context: Context, email: string) {
        await UserRoleService.addUserRole(context, email, Role.PREMIUM);
        await UserRoleService.removeUserRole(context, email, Role.FREE);
        ApiAlertsService.sendAlert('💸💸 NEW PREMIUM USER LFG');
    }

    public static async removePremium(context: Context, email: string) {
        await UserRoleService.addUserRole(context, email, Role.FREE);
        await UserRoleService.removeUserRole(context, email, Role.PREMIUM);
        await this.removePremiumFeatures(context, email);
        ApiAlertsService.sendAlert('we lost a premium user 😢');
    }

    private static async removePremiumFeatures(context: Context, email: string) {
        const user = await UserService.getByEmail(email);
        if (!user.id) {
            return;
        }

        const promises = [
            UserPropertyService.setReminderNotification(
                context,
                user.id,
                Constants.ReminderNotificationSetting.DAILY
            ),
            UserPropertyService.setWarningNotification(
                context,
                user.id,
                Constants.WarningNotificationSetting.DISABLED
            ),
        ];

        await Promise.all(promises);
    }
}
