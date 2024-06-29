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
        const promises = [
            this.refreshPremiumBadge(context),
            this.refreshAwayBadge(context),
            this.refreshNewUserBadge(context),
            this.refreshHabitStreakTierBadge(context),
        ];

        await Promise.all(promises);
    }

    /*
     * Premium Badge
     */

    public static async refreshPremiumBadge(context: Context) {
        await this.removePremiumBadge(context);
        await this.optionallyAddPremiumBadge(context);
    }

    public static async optionallyAddPremiumBadge(context: Context) {
        const shouldAddPremiumBadge = await this.shouldAddPremiumBadge(context);
        if (shouldAddPremiumBadge) {
            await this.addPremiumBadge(context);
        }
    }

    public static async addPremiumBadge(context: Context) {
        const containsPremiumBadge = await this.containsPremiumBadge(context);
        if (!containsPremiumBadge) {
            return this.addBadge(context, 'PREMIUM');
        }
    }

    public static async removePremiumBadge(context: Context) {
        const containsPremiumBadge = await this.containsPremiumBadge(context);
        if (containsPremiumBadge) {
            return this.removeBadge(context, 'PREMIUM');
        }
    }

    private static async containsPremiumBadge(context: Context) {
        return this.containsBadge(context, 'PREMIUM');
    }

    private static async shouldAddPremiumBadge(context: Context) {
        const userIsPremium = await UserService.isPremium(context, context.userId);
        return userIsPremium;
    }

    /*
     * Away Badge
     */

    public static async refreshAwayBadge(context: Context) {
        await this.removeAwayBadge(context);
        await this.optionallyAddAwayBadge(context);
    }

    public static async optionallyAddAwayBadge(context: Context) {
        const shouldAddAwayBadge = await this.shouldAddAwayBadge(context);
        if (shouldAddAwayBadge) {
            await this.addAwayBadge(context);
        }
    }

    public static async removeAwayBadge(context: Context) {
        const containsAwayBadge = await this.containsAwayBadge(context);
        if (containsAwayBadge) {
            return this.removeBadge(context, 'AWAY');
        }
    }

    public static async addAwayBadge(context: Context) {
        const containsAwayBadge = await this.containsAwayBadge(context);
        if (!containsAwayBadge) {
            return this.addBadge(context, 'AWAY');
        }
    }

    private static async shouldAddAwayBadge(context: Context) {
        const awayMode = await UserPropertyService.getAwayMode(context);
        return awayMode === Constants.AwayMode.ENABLED;
    }

    private static async containsAwayBadge(context: Context) {
        return this.containsBadge(context, 'AWAY');
    }

    /*
     * New User Badge
     */
    public static async refreshNewUserBadge(context: Context) {
        await this.removeNewUserBadge(context);
        await this.optionallyAddNewUserBadge(context);
    }

    public static async optionallyAddNewUserBadge(context: Context) {
        const shouldAddNewUserBadge = await this.shouldAddNewUserBadge(context);
        if (shouldAddNewUserBadge) {
            await this.addNewUserBadge(context);
        }
    }

    public static async addNewUserBadge(context: Context) {
        const containsNewUserBadge = await this.containsNewUserBadge(context);
        if (!containsNewUserBadge) {
            await this.addBadge(context, 'NEW_USER');
        }
    }

    public static async removeNewUserBadge(context: Context) {
        const containsNewUserBadge = await this.containsNewUserBadge(context);
        if (containsNewUserBadge) {
            return this.removeBadge(context, 'NEW_USER');
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

    private static async containsNewUserBadge(context: Context) {
        return this.containsBadge(context, 'NEW_USER');
    }

    /*
     * Habit Streak Tier Badge
     */

    public static async refreshHabitStreakTierBadge(context: Context) {
        console.log('Refreshing habit streak tier badge');
        await this.removeHabitStreakTierBadge(context);
        await this.optionallyAddHabitStreakTierBadge(context);
    }

    public static async removeHabitStreakTierBadge(context: Context) {
        console.log('Removing habit streak tier badge');
        const category = Constants.BadgeCategory.HABIT_STREAK_TIER;
        await this.removeBadgesByCategory(context, category);
    }

    public static async optionallyAddHabitStreakTierBadge(context: Context) {
        console.log('Optionally adding habit streak tier badge');
        const badgeToAdd = await this.getHabitStreakBadgeToAdd(context);
        if (!badgeToAdd?.key) {
            return;
        }

        await this.addBadge(context, badgeToAdd.key);
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

    private static async addBadge(context: Context, key: string) {
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

    private static async containsBadge(context: Context, key: string) {
        const badge = await BadgeService.get(context, key);
        if (!badge?.id) {
            return false;
        }

        const exists = await UserBadgeDao.exists(context.userId, badge.id);
        return !!exists;
    }

    private static async removeBadgesByCategory(
        context: Context,
        category: Constants.BadgeCategory
    ) {
        const badges = await BadgeService.getAllByCategory(context, category);
        for (const badge of badges) {
            if (!badge?.id || !badge.key) {
                continue;
            }

            const containsBadge = await this.containsBadge(context, badge.key);
            if (!containsBadge) {
                continue;
            }

            this.removeBadge(context, badge.key);
        }
    }

    private static async removeBadge(context: Context, key: string) {
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
}
