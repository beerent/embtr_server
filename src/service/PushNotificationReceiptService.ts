import { PushNotificationReceipt } from '@resources/schema';
import { PushNotificationReceiptDao } from '@src/database/PushNotificationReceiptDao';
import { Context } from '@src/general/auth/Context';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class PushNotificationReceiptService {
    public static async create(
        context: Context,
        message: string,
        userId: number,
        fromUserId?: number
    ) {
        const receipt = await PushNotificationReceiptDao.create(message, userId, fromUserId);
        if (!receipt) {
            throw new Error('Failed to create push notification receipt');
        }

        const receiptModel: PushNotificationReceipt = ModelConverter.convert(receipt);
        return receiptModel;
    }
}
