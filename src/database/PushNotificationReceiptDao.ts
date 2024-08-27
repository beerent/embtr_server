import { prisma } from '@database/prisma';
import { PushNotificationReceipt } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';

export class PushNotificationReceiptDao {
    public static async createAll(pushNotificationReceipts: PushNotificationReceipt[]) {
        await prisma.pushNotificationReceipt.createMany({
            data: pushNotificationReceipts.flatMap((pushNotificationReceipt) => {
                if (
                    !pushNotificationReceipt.userId ||
                    !pushNotificationReceipt.pushNotificationTokenId ||
                    !pushNotificationReceipt.message ||
                    !pushNotificationReceipt.expoStatus ||
                    !pushNotificationReceipt.expoTicketId
                ) {
                    return [];
                }

                return [
                    {
                        userId: pushNotificationReceipt.userId,
                        pushNotificationTokenId: pushNotificationReceipt.pushNotificationTokenId,
                        message: pushNotificationReceipt.message,
                        expoStatus: pushNotificationReceipt.expoStatus,
                        expoTicketId: pushNotificationReceipt.expoTicketId,
                        expoErrorMessage: pushNotificationReceipt.expoErrorMessage,
                        expoErrorDetail: pushNotificationReceipt.expoErrorDetail,
                    },
                ];
            }),
        });
    }

    public static async updateStatuses(pushNotificationReceipts: PushNotificationReceipt[]) {
        for (const pushNotificationReceipt of pushNotificationReceipts) {
            if (!pushNotificationReceipt.id) {
                continue;
            }

            await prisma.pushNotificationReceipt.update({
                where: {
                    id: pushNotificationReceipt.id,
                },
                data: {
                    status: pushNotificationReceipt.status,
                },
            });
        }
    }

    public static async updateAllByTicketId(pushNotificationReceipts: PushNotificationReceipt[]) {
        for (const pushNotificationReceipt of pushNotificationReceipts) {
            if (!pushNotificationReceipt.expoTicketId) {
                continue;
            }

            await prisma.pushNotificationReceipt.update({
                where: {
                    expoTicketId: pushNotificationReceipt.expoTicketId,
                },
                data: {
                    status: pushNotificationReceipt.status,
                    expoStatus: pushNotificationReceipt.expoStatus,
                    expoErrorMessage: pushNotificationReceipt.expoErrorMessage,
                    expoErrorDetail: pushNotificationReceipt.expoErrorDetail,
                },
            });
        }
    }

    public static async getAllByStatus(status: Constants.PushNotificationStatus) {
        const pendingReceipts = await prisma.pushNotificationReceipt.findMany({
            where: {
                status,
            },
        });

        return pendingReceipts;
    }

    public static async countAllByStatus() {
        const counts = await prisma.pushNotificationReceipt.groupBy({
            by: ['status'],
            _count: true,
        });

        return counts;
    }
}
