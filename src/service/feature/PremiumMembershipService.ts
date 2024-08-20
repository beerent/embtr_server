import { Context, UserContext } from '@src/general/auth/Context';
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
    public static async addPremium(context: UserContext) {
        await UserRoleService.addUserRole(context, context.userUid, Role.PREMIUM);
        await UserRoleService.removeUserRole(context, context.userUid, Role.FREE);

        UserEventDispatcher.onPremiumAdded(context);
        ApiAlertsService.sendAlert('💸💸 NEW PREMIUM USER LFG');
    }

    public static async removePremium(context: Context, user: User) {
        if (!user.uid) {
            return;
        }

        await UserRoleService.addUserRole(context, user.uid, Role.FREE);
        await UserRoleService.removeUserRole(context, user.uid, Role.PREMIUM);
        await this.removePremiumFeatures(context, user.uid);

        const userContext = ContextService.impersonateUserContext(context, user);
        UserEventDispatcher.onPremiumRemoved(userContext);
        ApiAlertsService.sendAlert('we lost a premium user 😢');
    }

    private static async removePremiumFeatures(context: Context, uid: string) {
        const user = await UserService.getByUid(uid);
        if (!user?.id) {
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
