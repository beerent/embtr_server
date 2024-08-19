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

    public static async getAllPending() {
        const pendingReceipts = await prisma.pushNotificationReceipt.findMany({
            where: {
                status: Constants.PushNotificationStatus.PENDING,
            },
        });

        return pendingReceipts;
    }
}
