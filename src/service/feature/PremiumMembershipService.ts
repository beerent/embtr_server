import { Context } from '@src/general/auth/Context';
import { Role } from '@src/roles/Roles';
import { ApiAlertsService } from '../ApiAlertsService';
import { UserRoleService } from '../UserRoleService';
import { UserPropertyService } from '@src/service/UserPropertyService';
import { UserService } from '../UserService';
import { Constants } from '@resources/types/constants/constants';
import { UserEventDispatcher } from '@src/event/user/UserEventDispatcher';
import { ContextService } from '../ContextService';
import { User } from '@resources/schema';

export class PremiumMembershipService {
    public static async addPremium(context: Context, user: User) {
        if (!user.email) {
            return;
        }

        await UserRoleService.addUserRole(context, user.email, Role.PREMIUM);
        await UserRoleService.removeUserRole(context, user.email, Role.FREE);

        const userContext = ContextService.impersonateUserContext(context, user);
        UserEventDispatcher.onPremiumAdded(userContext);
        ApiAlertsService.sendAlert('💸💸 NEW PREMIUM USER LFG');
    }

    public static async removePremium(context: Context, user: User) {
        if (!user.email) {
            return;
        }

        await UserRoleService.addUserRole(context, user.email, Role.FREE);
        await UserRoleService.removeUserRole(context, user.email, Role.PREMIUM);
        await this.removePremiumFeatures(context, user.email);

        const userContext = ContextService.impersonateUserContext(context, user);
        UserEventDispatcher.onPremiumRemoved(userContext);
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
