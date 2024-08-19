import { PushNotificationReceipt } from '@resources/schema';
import { PushNotificationReceiptDao } from '@src/database/PushNotificationReceiptDao';
import { Context } from '@src/general/auth/Context';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class PushNotificationReceiptService {
    public static async createAll(
        context: Context,
        pushNotificationReceipts: PushNotificationReceipt[]
    ) {
        await PushNotificationReceiptDao.createAll(pushNotificationReceipts);
    }

    public static async getAllPending(context: Context): Promise<PushNotificationReceipt[]> {
        const pendingReceipts = await PushNotificationReceiptDao.getAllPending();
        const pendingReceiptModels: PushNotificationReceipt[] =
            ModelConverter.convertAll(pendingReceipts);

        return pendingReceiptModels;
    }

    public static async UpdateAllByTicketId(
        context: Context,
        pushNotificationReceipts: PushNotificationReceipt[]
    ) {
        PushNotificationReceiptDao.updateAllByTicketId(pushNotificationReceipts);
    }
}
