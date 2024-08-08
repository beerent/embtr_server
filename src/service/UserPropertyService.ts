import { Context } from '@src/general/auth/Context';
import { Property, User } from '@resources/schema';
import { UserPropertyDao, ValueCountMap } from '@src/database/UserPropertyDao';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { ServiceException } from '@src/general/exception/ServiceException';
import { Code } from '@resources/codes';
import { Constants } from '@resources/types/constants/constants';
import { Roles } from '@src/roles/Roles';
import { HttpCode } from '@src/common/RequestResponses';
import { UserService } from './UserService';
import { UserPropertyEventDispatcher } from '@src/event/user_property/UserPropertyEventDispatcher';

export class UserPropertyService {
    public static async getAll(context: Context, userId: number): Promise<Property[]> {
        const properties = await UserPropertyDao.getAll(userId);
        const propertyModels: Property[] = properties.map((property) =>
            ModelConverter.convert(property)
        );

        return propertyModels;
    }

    /* TIMEZONE */
    public static async getTimezone(context: Context, userId: number): Promise<string> {
        const timezone = await this.get(context, userId, Constants.UserPropertyKey.TIMEZONE);
        if (!timezone?.value) {
            return 'N/A';
        }

        return timezone.value;
    }

    public static async setTimezone(context: Context, timezone: string): Promise<string> {
        await UserPropertyService.set(
            context,
            context.userId,
            Constants.UserPropertyKey.TIMEZONE,
            timezone
        );

        return timezone;
    }

    public static async setTutorialCompletionState(context: Context, state: string): Promise<User> {
        await UserPropertyService.set(
            context,
            context.userId,
            Constants.UserPropertyKey.TUTORIAL_COMPLETED,
            state
        );

        const user = await UserService.get(context, context.userUid);
        if (!user) {
            throw new ServiceException(
                HttpCode.GENERAL_FAILURE,
                Code.USER_NOT_FOUND,
                'user not found'
            );
        }

        return user;
    }

    public static async setOperatingSystemState(
        context: Context,
        operatingSystem: string
    ): Promise<User> {
        await UserPropertyService.set(
            context,
            context.userId,
            Constants.UserPropertyKey.OPERATING_SYSTEM,
            operatingSystem
        );

        const user = await UserService.get(context, context.userUid);
        if (!user) {
            throw new ServiceException(
                HttpCode.GENERAL_FAILURE,
                Code.USER_NOT_FOUND,
                'user not found'
            );
        }

        return user;
    }

    public static async getTutorialCompletionState(
        context: Context
    ): Promise<Constants.CompletionState> {
        const property = await this.get(
            context,
            context.userId,
            Constants.UserPropertyKey.TUTORIAL_COMPLETED
        );

        if (!property?.value) {
            return Constants.CompletionState.INVALID;
        }

        return Constants.getCompletionState(property.value);
    }

    /* AWAY */
    public static async getAwayMode(context: Context): Promise<Constants.AwayMode> {
        const away = await this.get(context, context.userId, Constants.UserPropertyKey.AWAY_MODE);
        if (!away?.value) {
            return Constants.AwayMode.INVALID;
        }

        const awayMode = Constants.getAwayMode(away.value);
        return awayMode;
    }

    public static async setAwayMode(context: Context, awayMode: Constants.AwayMode) {
        await UserPropertyService.set(
            context,
            context.userId,
            Constants.UserPropertyKey.AWAY_MODE,
            awayMode
        );
    }

    /* NOTIFICATION SOCIAL */
    public static async getSocialNotification(
        context: Context,
        userId: number
    ): Promise<Constants.SocialNotificationSetting | undefined> {
        const property = await this.get(
            context,
            userId,
            Constants.UserPropertyKey.SOCIAL_NOTIFICATIONS_SETTING
        );

        if (!property?.value) {
            return undefined;
        }

        return Constants.getSocialNotificationsSetting(property.value);
    }

    public static async setSocialNotification(
        context: Context,
        userId: number,
        value: string
    ): Promise<Property> {
        return this.set(
            context,
            userId,
            Constants.UserPropertyKey.SOCIAL_NOTIFICATIONS_SETTING,
            value
        );
    }

    /* REMINDER NOTIFICATION */
    public static async getReminderNotification(
        context: Context,
        userId: number
    ): Promise<Constants.ReminderNotificationSetting | undefined> {
        const property = await this.get(
            context,
            userId,
            Constants.UserPropertyKey.REMINDER_NOTIFICATIONS_SETTING
        );

        if (!property?.value) {
            return undefined;
        }

        return Constants.getReminderNotificationsSetting(property.value);
    }

    public static async setReminderNotification(
        context: Context,
        userId: number,
        setting: Constants.ReminderNotificationSetting
    ): Promise<Property> {
        const premiumSettings = [Constants.ReminderNotificationSetting.PERIODICALLY];
        const isPremiumSetting = premiumSettings.includes(setting);
        const isPremiumUser = Roles.isPremium(context.userRoles);
        if (isPremiumSetting && !isPremiumUser) {
            throw new ServiceException(
                HttpCode.UNAUTHORIZED,
                Code.MISSING_PREMIUM,
                'premium required'
            );
        }

        return this.set(
            context,
            userId,
            Constants.UserPropertyKey.REMINDER_NOTIFICATIONS_SETTING,
            setting
        );
    }

    /* WARNING NOTIFICATION */
    public static async getWarningNotification(
        context: Context
    ): Promise<Constants.WarningNotificationSetting | undefined> {
        const property = await this.get(
            context,
            context.userId,
            Constants.UserPropertyKey.WARNING_NOTIFICATIONS_SETTING
        );

        if (!property?.value) {
            return undefined;
        }

        return Constants.getWarningNotificationSetting(property.value);
    }

    public static async setWarningNotification(
        context: Context,
        userId: number,
        setting: Constants.WarningNotificationSetting
    ): Promise<Property> {
        const premiumSettings = [
            Constants.WarningNotificationSetting.DAILY,
            Constants.WarningNotificationSetting.PERIODICALLY,
        ];
        const isPremiumSetting = premiumSettings.includes(setting);
        const isPremiumUser = Roles.isPremium(context.userRoles);
        if (isPremiumSetting && !isPremiumUser) {
            throw new ServiceException(
                HttpCode.UNAUTHORIZED,
                Code.MISSING_PREMIUM,
                'premium required'
            );
        }

        return this.set(
            context,
            userId,
            Constants.UserPropertyKey.WARNING_NOTIFICATIONS_SETTING,
            setting
        );
    }

    public static async setNewUserChecklistDismissed(context: Context): Promise<void> {
        await this.set(
            context,
            context.userId,
            Constants.UserPropertyKey.NEW_USER_CHECKLIST_DISMISSED,
            context.dayKey
        );
    }

    public static async getNewUserChecklistDismissed(context: Context): Promise<boolean> {
        const property = await this.get(
            context,
            context.userId,
            Constants.UserPropertyKey.NEW_USER_CHECKLIST_DISMISSED
        );

        return !!property;
    }

    public static async setNewUserChecklistCompleted(context: Context): Promise<void> {
        await this.set(
            context,
            context.userId,
            Constants.UserPropertyKey.NEW_USER_CHECKLIST_COMPLETED,
            context.dayKey
        );
    }

    public static async getNewUserChecklistCompleted(context: Context): Promise<boolean> {
        const property = await this.get(
            context,
            context.userId,
            Constants.UserPropertyKey.NEW_USER_CHECKLIST_COMPLETED
        );

        return !!property;
    }

    public static async setDefaultProperties(context: Context, userId: number): Promise<void> {
        const promises = [
            this.getSocialNotification(context, userId),
            this.getWarningNotification(context),
            this.getReminderNotification(context, userId),
        ];

        const [social, warning, reminder] = await Promise.all(promises);
        if (!social) {
            this.setSocialNotification(
                context,
                userId,
                Constants.SocialNotificationSetting.ENABLED
            );
        }

        if (!reminder) {
            this.setReminderNotification(
                context,
                userId,
                Constants.ReminderNotificationSetting.DAILY
            );
        }

        if (!warning) {
            this.setWarningNotification(
                context,
                userId,
                Constants.WarningNotificationSetting.DISABLED
            );
        }
    }

    public static async getAllHabitStreakCurrent(context: Context): Promise<Property[]> {
        const allCurrent = await UserPropertyDao.getAllByKey('HABIT_STREAK_CURRENT');
        const models: Property[] = ModelConverter.convertAll(allCurrent);

        return models;
    }

    public static async getAllHabitStreakLongest(context: Context): Promise<Property[]> {
        const allLatest = await UserPropertyDao.getAllByKey('HABIT_STREAK_LONGEST');
        const models: Property[] = ModelConverter.convertAll(allLatest);

        return models;
    }

    /* POINTS */
    public static async getPoints(context: Context): Promise<number> {
        const timezone = await this.get(context, context.userId, Constants.UserPropertyKey.POINTS);
        if (!timezone?.value) {
            return 0;
        }

        return parseInt(timezone.value);
    }

    public static async setPoints(context: Context, points: number): Promise<number> {
        await UserPropertyService.set(
            context,
            context.userId,
            Constants.UserPropertyKey.POINTS,
            points.toString()
        );

        UserPropertyEventDispatcher.onUpdated(
            context,
            Constants.UserPropertyKey.POINTS,
            points.toString()
        );

        return points;
    }

    public static async getLevel(context: Context): Promise<number> {
        const level = await this.get(context, context.userId, Constants.UserPropertyKey.LEVEL);
        if (!level?.value) {
            return 0;
        }

        return parseInt(level.value);
    }

    public static async setLevel(context: Context, level: number): Promise<number> {
        await UserPropertyService.set(
            context,
            context.userId,
            Constants.UserPropertyKey.LEVEL,
            level.toString()
        );

        //console.log('Level updated', level);

        return level;
    }

    public static async getFeatureVote(context: Context): Promise<number | undefined> {
        const voteId = await this.get(
            context,
            context.userId,
            Constants.UserPropertyKey.FEATURE_VOTE
        );
        if (!voteId?.value) {
            return undefined;
        }

        return parseInt(voteId.value);
    }

    public static async setFeatureVote(context: Context, id: number) {
        await UserPropertyService.set(
            context,
            context.userId,
            Constants.UserPropertyKey.FEATURE_VOTE,
            id.toString()
        );
    }

    public static async countVotesByKey(
        context: Context,
        key: Constants.UserPropertyKey
    ): Promise<ValueCountMap> {
        return UserPropertyDao.countByDistinctValueForKey(key);
    }

    private static async get(
        context: Context,
        userId: number,
        key: Constants.UserPropertyKey
    ): Promise<Property | undefined> {
        const property = await UserPropertyDao.getByKey(userId, key);
        if (!property) {
            return undefined;
        }

        const propertyModel: Property = ModelConverter.convert(property);
        return propertyModel;
    }

    private static async set(
        context: Context,
        userId: number,
        key: Constants.UserPropertyKey,
        value: string
    ): Promise<Property> {
        if (!key || !value) {
            throw new ServiceException(
                400,
                Code.INVALID_PROPERTY,
                'invalid create property request'
            );
        }

        const createdProperty = await UserPropertyDao.set(userId, key, value);
        const createdPropertyModel: Property = ModelConverter.convert(createdProperty);

        return createdPropertyModel;
    }
}
