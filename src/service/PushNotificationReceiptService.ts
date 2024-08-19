import { PushNotificationReceipt } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';
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
        return await this.getAllByStatus(context, Constants.PushNotificationStatus.PENDING);
    }

    public static async getAllFailed(context: Context): Promise<PushNotificationReceipt[]> {
        return await this.getAllByStatus(context, Constants.PushNotificationStatus.FAILED);
    }

    private static async getAllByStatus(
        context: Context,
        status: Constants.PushNotificationStatus
    ): Promise<PushNotificationReceipt[]> {
        const pendingReceipts = await PushNotificationReceiptDao.getAllByStatus(status);
        const pendingReceiptModels: PushNotificationReceipt[] =
            ModelConverter.convertAll(pendingReceipts);

        return pendingReceiptModels;
    }

    public static async UpdateAllByTicketId(
        context: Context,
        pushNotificationReceipts: PushNotificationReceipt[]
    ) {
        await PushNotificationReceiptDao.updateAllByTicketId(pushNotificationReceipts);
    }

    public static async UpdateStatuses(
        context: Context,
        pushNotificationReceipts: PushNotificationReceipt[]
    ) {
        await PushNotificationReceiptDao.updateStatuses(pushNotificationReceipts);
    }
}
