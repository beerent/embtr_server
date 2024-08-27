import { PushNotificationReceipt } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';
import { PushNotificationStats } from '@resources/types/dto/PushNotification';
import { PushNotificationReceiptDao } from '@src/database/PushNotificationReceiptDao';
import { AdminContext, Context } from '@src/general/auth/Context';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class PushNotificationReceiptService {
    public static async getStats(context: AdminContext) {
        const totalsByStatus = await PushNotificationReceiptDao.countAllByStatus();
        const allTotals = totalsByStatus.reduce((acc, total) => {
            return acc + total._count;
        }, 0);

        const pendingCount = this.getCountFromStats(
            totalsByStatus,
            Constants.PushNotificationStatus.PENDING
        );

        const failedCount = this.getCountFromStats(
            totalsByStatus,
            Constants.PushNotificationStatus.FAILED
        );

        const sentCount = this.getCountFromStats(
            totalsByStatus,
            Constants.PushNotificationStatus.SENT
        );

        const failedAcknowledgedCount = this.getCountFromStats(
            totalsByStatus,
            Constants.PushNotificationStatus.FAILED_ACKNOWLEDGED
        );

        const failedInvalidatedCount = this.getCountFromStats(
            totalsByStatus,
            Constants.PushNotificationStatus.FAILED_INVALIDATED
        );

        const stats: PushNotificationStats = {
            total: allTotals,
            pending: pendingCount,
            sent: sentCount,
            failed: failedCount,
            failedAcknowledged: failedAcknowledgedCount,
            failedInvalidated: failedInvalidatedCount,
        };

        return stats;
    }

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

    private static getCountFromStats(
        totalsByStatus: any[],
        status: Constants.PushNotificationStatus
    ) {
        const count =
            totalsByStatus.find((total) => {
                return total.status === status;
            })?._count || 0;

        return count;
    }
}
