import { Context } from '@src/general/auth/Context';
import { PushNotificationToken } from '@resources/schema';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { PushNotificationTokenDao } from '@src/database/PushNotificationTokenDao';
import { logger } from '@src/common/logger/Logger';

export class PushNotificationTokenService {
    public static async getAllForUser(context: Context): Promise<PushNotificationToken[]> {
        const pushNotificationTokens = await PushNotificationTokenDao.getAllById(context.userId);
        const pushNotificationTokenModels: PushNotificationToken[] =
            ModelConverter.convertAll(pushNotificationTokens);

        return pushNotificationTokenModels;
    }

    public static async getByToken(token: string) {
        const pushNotificationToken = await PushNotificationTokenDao.getByToken(token);
        if (!pushNotificationToken) {
            return undefined;
        }

        const pushNotificationTokenModel: PushNotificationToken =
            ModelConverter.convert(pushNotificationToken);

        return pushNotificationTokenModel;
    }

    public static async register(context: Context, token: string): Promise<void> {
        const existingToken = await PushNotificationTokenDao.getByToken(token);
        if (existingToken?.active) {
            return;
        }

        if (existingToken?.active === false) {
            logger.info('invalidated token found, revalidating');
            await PushNotificationTokenDao.revalidate(existingToken.userId, existingToken.token);
            return;
        }

        logger.info('registering new token');
        await PushNotificationTokenDao.create(context.userUid, token);
    }

    public static async invalidateAll(context: Context, ids: number[]) {
        await PushNotificationTokenDao.invalidateAll(ids);
    }
}
