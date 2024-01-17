import { Context } from '@src/general/auth/Context';
import { PushNotificationToken } from '@resources/schema';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { PushNotificationTokenDao } from '@src/database/PushNotificationTokenDao';

export class PushNotificationTokenService {
    public static async getAllForUser(context: Context): Promise<PushNotificationToken[]> {
        const pushNotificationTokens = await PushNotificationTokenDao.getAllById(context.userId);
        const pushNotificationTokenModels: PushNotificationToken[] =
            ModelConverter.convertAll(pushNotificationTokens);

        return pushNotificationTokenModels;
    }

    public static async register(context: Context, token: string): Promise<void> {
        const userPushNotificationTokens =
            await PushNotificationTokenService.getAllForUser(context);
        const alreadyRegistered = userPushNotificationTokens.some(
            (pushNotificationToken) => pushNotificationToken.token === token
        );
        if (alreadyRegistered) {
            return;
        }

        await PushNotificationTokenDao.create(context.userUid, token);
    }
}
