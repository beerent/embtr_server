import { Constants } from '@resources/types/constants/constants';
import { UserBadgeDao } from '@src/database/UserBadgeDao';
import { Context } from '@src/general/auth/Context';
import { UserService } from '@src/service/UserService';
import { BadgeService } from './BadgeService';
import { ServiceException } from '@src/general/exception/ServiceException';
import { HttpCode } from '@src/common/RequestResponses';
import { Code } from '@resources/codes';
import { UserPropertyService } from './UserPropertyService';
import { HabitStreakTierService } from './HabitStreakTierService';
import { HabitStreakService } from './HabitStreakService';

// "15 months is almost a year" - TheCaptainCoder - 2024-06-21

export class UserBadgeService {
    public static async refreshAllBadges(context: Context) {
        await this.removeAllBadges(context);

        const promises = [
            this.optionallyAddPremiumBadge(context),
            this.optionallyAddAwayBadge(context),
            this.optionallyAddNewUserBadge(context),
            this.optionallyAddHabitStreakTierBadge(context),
        ];

        await Promise.all(promises);
    }

    /*
     * Premium Badge
     */

    public static async optionallyAddPremiumBadge(context: Context) {
        const shouldAddPremiumBadge = await this.shouldAddPremiumBadge(context);
        if (shouldAddPremiumBadge) {
            await this.addPremiumBadge(context);
        }
    }

    private static async shouldAddPremiumBadge(context: Context) {
        const userIsPremium = await UserService.isPremium(context, context.userId);
        return userIsPremium;
    }

    private static async addPremiumBadge(context: Context) {
        return this.addBadge(context, Constants.Badge.PREMIUM);
    }

    private static async containsPremiumBadge(context: Context) {
        return this.containsBadge(context, Constants.Badge.PREMIUM);
    }

    private static async removePremiumBadge(context: Context) {
        return this.removeBadge(context, Constants.Badge.PREMIUM);
    }

    /*
     * Away Badge
     */
    public static async optionallyAddAwayBadge(context: Context) {
        const shouldAddAwayBadge = await this.shouldAddAwayBadge(context);
        if (shouldAddAwayBadge) {
            await this.addAwayBadge(context);
        }
    }

    private static async shouldAddAwayBadge(context: Context) {
        const awayMode = await UserPropertyService.getAwayMode(context);
        return awayMode === Constants.AwayMode.ENABLED;
    }

    private static async addAwayBadge(context: Context) {
        return this.addBadge(context, Constants.Badge.AWAY);
    }

    private static async containsAwayBadge(context: Context) {
        return this.containsBadge(context, Constants.Badge.AWAY);
    }

    private static async removeAwayBadge(context: Context) {
        return this.removeBadge(context, Constants.Badge.AWAY);
    }

    /*
     * New User Badge
     */
    public static async optionallyAddNewUserBadge(context: Context) {
        const shouldAddNewUserBadge = await this.shouldAddNewUserBadge(context);
        if (shouldAddNewUserBadge) {
            await this.addNewUserBadge(context);
        }
    }

    private static async shouldAddNewUserBadge(context: Context) {
        const user = await UserService.get(context, context.userUid);
        if (!user?.createdAt) {
            return false;
        }

        const createdDate = new Date(user.createdAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return createdDate > sevenDaysAgo;
    }

    private static async addNewUserBadge(context: Context) {
        return this.addBadge(context, Constants.Badge.NEW_USER);
    }

    private static async containsNewUserBadge(context: Context) {
        return this.containsBadge(context, Constants.Badge.NEW_USER);
    }

    private static async removeNewUserBadge(context: Context) {
        return this.removeBadge(context, Constants.Badge.NEW_USER);
    }

    /*
     * Habit Streak Tier Badge
     */
    public static async optionallyAddHabitStreakTierBadge(context: Context) {
        const badgeToAdd = await this.getHabitStreakBadgeToAdd(context);
        if (!badgeToAdd?.key) {
            return;
        }

        const badgeKey = Constants.getBadge(badgeToAdd.key);

        await this.addBadge(context, badgeKey);
    }

    public static async getHabitStreakBadgeToAdd(context: Context) {
        const habitStreakTiers = await HabitStreakTierService.getAllWithBadge(context);
        const currentHabitStreak = await HabitStreakService.getCurrentHabitStreak(
            context,
            context.userId
        );

        let foundHabitStreakTier = undefined;
        for (const habitStreakTier of habitStreakTiers) {
            const min = habitStreakTier.minStreak ?? -1;
            const max = habitStreakTier.maxStreak ?? -1;
            const streak = currentHabitStreak?.streak ?? -1;

            if (streak >= min && streak <= max) {
                foundHabitStreakTier = habitStreakTier;
                break;
            }
        }

        return foundHabitStreakTier?.badge;
    }

    private static async containsHabitStreakTierBadge(context: Context) {
        const containsBadge = await this.containsBadgeByCategory(
            context,
            Constants.BadgeCategory.HABIT_STREAK_TIER
        );

        return containsBadge;
    }

    private static async addBadge(context: Context, key: Constants.Badge) {
        const badge = await BadgeService.get(context, key);
        if (!badge?.id) {
            throw new ServiceException(
                HttpCode.GENERAL_FAILURE,
                Code.GENERIC_ERROR,
                'cannot add badge, badge not found'
            );
        }

        console.log('  Adding badge', badge.key);
        await UserBadgeDao.create(context.userId, badge.id);
    }

    private static async containsBadge(context: Context, key: Constants.Badge) {
        const badge = await BadgeService.get(context, key);
        if (!badge?.id) {
            return false;
        }

        const exists = await UserBadgeDao.exists(context.userId, badge.id);
        return !!exists;
    }

    private static async containsBadgeByCategory(
        context: Context,
        category: Constants.BadgeCategory
    ) {
        const badges = await BadgeService.getAllByCategory(context, category);
        const ids = badges.map((badge) => badge.id).flatMap((id) => (id ? [id] : []));
        const contains = await UserBadgeDao.contains(context.userId, ids);
        return !!contains;
    }

    private static async removeBadge(context: Context, key: Constants.Badge) {
        const badge = await BadgeService.get(context, key);
        if (!badge?.id) {
            throw new ServiceException(
                HttpCode.GENERAL_FAILURE,
                Code.GENERIC_ERROR,
                'cannot remove badge, badge not found'
            );
        }

        console.log('  Removing badge', badge.key);
        await UserBadgeDao.delete(context.userId, badge.id);
    }

    private static async removeAllBadges(context: Context) {
        for (const badge of Object.values(Constants.Badge)) {
            const containsBadge = await this.containsBadge(context, badge);
            if (!containsBadge) {
                continue;
            }

            await this.removeBadge(context, badge);
        }
    }
}
