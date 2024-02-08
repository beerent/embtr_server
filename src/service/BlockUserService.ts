import { Context } from '@src/general/auth/Context';
import { Code } from '@resources/codes';
import { ServiceException } from '@src/general/exception/ServiceException';
import { BlockUserDao } from '@src/database/BlockUserDao';

export class BlockUserService {
    public static async create(context: Context, userId: number) {
        const blockExists = await BlockUserDao.exists(context.userId, userId);
        if (blockExists) {
            throw new ServiceException(409, Code.BLOCK_USER_ALREADY_EXISTS, 'user already blocked');
        }

        if (context.userId === userId) {
            throw new ServiceException(400, Code.BLOCK_SELF, 'cannot block self');
        }

        await BlockUserDao.create(context.userId, userId);
    }

    public static async getBlockedAndBlockedByUserIds(context: Context): Promise<number[]> {
        const promises = [
            BlockUserDao.getBlockedUserIds(context.userId),
            BlockUserDao.getBlockedByUserIds(context.userId),
        ];

        const [blockedUserIds, blockedByUserIds] = await Promise.all(promises);
        const joinedBlockedUserIds = blockedUserIds.concat(blockedByUserIds);

        return joinedBlockedUserIds;
    }

    public static async getBlockedUserIds(context: Context): Promise<number[]> {
        const blockedUserIds = await BlockUserDao.getBlockedUserIds(context.userId);
        return blockedUserIds;
    }

    public static async getBlockedByUserIds(context: Context): Promise<number[]> {
        const blockedByUserIds = await BlockUserDao.getBlockedByUserIds(context.userId);
        return blockedByUserIds;
    }
}
