process.env.TZ = 'UTC';
require('module-alias/register');

import * as readline from 'readline';
import { UserRoleService } from './service/UserRoleService';
import { Context } from './general/auth/Context';
import { Role } from './roles/Roles';
import { AccountService } from './service/AccountService';
import { UserService } from './service/UserService';
import { RevenueCatService } from './service/internal/RevenueCatService';
import { PlannedDayService } from './service/PlannedDayService';
import { HabitStreakService } from './service/HabitStreakService';
import { ReminderService } from './service/feature/ReminderService';
import { Constants } from '@resources/types/constants/constants';
import { UserPropertyService } from './service/UserPropertyService';
import { UserDao } from './database/UserDao';
import { UserAwardService } from './service/UserAwardService';
import { ChallengeCalculationType, User } from '@resources/schema';
import { DayKeyUtility } from './utility/date/DayKeyUtility';
import { ChallengeFullService } from './service/feature/ChallengeFullService';
import { CreateIconRequest } from '@resources/types/requests/IconTypes';
import { IconCreationService } from './service/feature/IconCreationService';
import { ChallengeService } from './service/ChallengeService';
import {
    CreateChallengeFullRequest,
    UpdateChallengeFullRequest,
} from '@resources/types/requests/ChallengeTypes';
import { ChallengeController } from './controller/ChallengeController';

// ‘It’s started to rain we need a Macintosh’ - T_G_Digital - 2024-04-05

const adminContext: Context = {
    userId: 1853,
    userUid: 'hello',
    userEmail: 'bnren',
    userRoles: [],
    dayKey: '04-04-2021',
    timeZone: 'America/New_York',
    dateTime: new Date(),
};

const impersonateContext = (user: User): Context => {
    const context: Context = {
        userId: user.id || 0,
        userUid: user.uid || '',
        userEmail: user.email || '',
        userRoles: [],
        dayKey: DayKeyUtility.getTodayKey(),
        timeZone: 'America/New_York',
        dateTime: new Date(),
    };

    return context;
};

const handleCommandGetProperties = async (username: string) => {
    const user = await UserService.getByUsername(username);
    if (!user?.id) {
        console.log('user not found');
        return;
    }

    const properties = await UserPropertyService.getAll(adminContext, user.id);
    const propertyStrings = properties.map((property) => {
        return `${property.key}: ${property.value}`;
    });
};

const handleCommandGetRoles = async (email: string) => {
    try {
        const user = await UserDao.getByUsername(email);
        if (!user?.id) {
            console.log('user not found');
            return;
        }

        const roles = await UserRoleService.getRoles(user.email);
        console.log(roles);
    } catch (error) {
        console.log('[]');
    }
};

const handleCommandIsAdmin = async (email: string) => {
    try {
        const user = await UserDao.getByUsername(email);
        if (!user?.id) {
            console.log('user not found');
            return;
        }

        const isAdmin = await UserRoleService.isAdmin(user.email);
        console.log(!!isAdmin);
    } catch (error) {
        console.log('false');
    }
};
const handleCommandIsUser = async (email: string) => {
    try {
        const isUser = await UserRoleService.isUser(email);
        console.log(!!isUser);
    } catch (error) {
        console.log('false');
    }
};

const handleCommandAddAdminRole = async (email: string) => {
    const user = await UserDao.getByUsername(email);
    if (!user?.id) {
        console.log('user not found');
        return;
    }

    await UserRoleService.addUserRole(adminContext, user.email, Role.ADMIN);
};

const handleCommandAddUserRole = async (email: string) => {
    if (email) {
        await UserRoleService.addUserRole(adminContext, email, Role.USER);
    }
};

const handleCommandRemoveAdminRole = async (email: string) => {
    if (email) {
        await UserRoleService.removeUserRole(adminContext, email, Role.ADMIN);
    }
};

const handleCommandRemoveUserRole = async (email: string) => {
    if (email) {
        await UserRoleService.removeUserRole(adminContext, email, Role.USER);
    }
};

const handleAccountExists = async (email: string) => {
    try {
        const account = await AccountService.get(adminContext, email);
        console.log(!!account);
    } catch (error) {
        console.log('false');
    }
};

const handleUserExists = async (email: string) => {
    try {
        const user = await UserService.getByEmail(email);
        console.log(!!user);
    } catch (error) {
        console.log('false');
    }
};

const handleEmailVerified = async (email: string) => {
    try {
        const emailVerified = await AccountService.emailIsVerified(email);
        console.log(emailVerified);
    } catch (error) {
        console.log('false');
    }
};

const handleVerifyEmail = async (email: string) => {
    try {
        await AccountService.manuallyVerifyEmail(email);
    } catch (error) { }
};

const handleRevokeToken = async (email: string) => {
    try {
        const account = await AccountService.get(adminContext, email);
        if (account) {
            await AccountService.revokeToken(email);
        }
    } catch (error) { }
};

const handleCommandIsPremium = async (username: string) => {
    try {
        const user = await UserService.getByUsername(username);
        if (!user?.uid) {
            console.log('user not found');
            return;
        }

        const isPremium = await RevenueCatService.isPremium(user.uid);
        console.log(!!isPremium);
    } catch (error) {
        console.log('error checking premium status');
    }
};

const handleCommandUpdateAllPlannedDayStatusesForAllUsers = async () => {
    const users = await UserService.getAll(adminContext);
    let count = 0;
    for (const user of users) {
        if (!user.id) {
            continue;
        }

        count++;
        console.log('updating (', count, '/', users.length, ')');

        await PlannedDayService.backPopulateCompletionStatuses(adminContext, user.id);
    }
};

const handleCommandUpdateAllPlannedDayStatusesForUser = async (email: string) => {
    const user = await UserService.getByUsername(email);
    if (!user?.id) {
        console.log('user not found');
        return;
    }

    await PlannedDayService.backPopulateCompletionStatuses(adminContext, user.id);
};

const handleCommandUpdateUserStreaks = async (username: string) => {
    const user = await UserService.getByUsername(username);
    if (!user?.id) {
        console.log('user not found');
        return;
    }

    await HabitStreakService.fullPopulateCurrentStreak(adminContext, user.id);
    await HabitStreakService.fullPopulateLongestStreak(adminContext, user.id);
};

const handleCommandUpdateAllUserStreaks = async () => {
    const users = await UserService.getAll(adminContext);
    let count = 0;
    for (const user of users) {
        if (!user.id) {
            continue;
        }

        count++;
        console.log('updating (', count, '/', users.length, ')');

        await HabitStreakService.fullPopulateCurrentStreak(adminContext, user.id);
        await HabitStreakService.fullPopulateLongestStreak(adminContext, user.id);
    }
};

const handleCommandSendUserDailyReminders = async (username: string) => {
    const user = await UserService.getByUsername(username);
    if (!user?.id) {
        console.log('user not found');
        return;
    }

    await ReminderService.sendUserDailyReminder(adminContext, user);
};

const handleCommandSendUserPeriodicReminders = async (username: string) => {
    const user = await UserService.getByUsername(username);
    if (!user?.id) {
        console.log('user not found');
        return;
    }

    await ReminderService.sendUserPeriodicReminder(adminContext, user);
};

const handleCommandSendUserDailyWarnings = async (username: string) => {
    const user = await UserService.getByUsername(username);
    if (!user?.id) {
        console.log('user not found');
        return;
    }

    await ReminderService.sendUserDailyWarning(adminContext, user);
};

const handleCommandSendUserPeriodicWarnings = async (username: string) => {
    const user = await UserService.getByUsername(username);
    if (!user?.id) {
        console.log('user not found');
        return;
    }

    await ReminderService.sendUserPeriodicWarning(adminContext, user);
};

const handleCommandUpdateAllAwardsForAllUsers = async () => {
    const users = await UserService.getAll(adminContext);
    let count = 0;
    for (const user of users) {
        if (!user.id) {
            continue;
        }

        count++;
        console.log('updating (', count, '/', users.length, ')');

        const context: Context = impersonateContext(user);
        await UserAwardService.refreshAwardsFromChallenges(context);
    }
};

const handleCommandUpdateAllAwardsForUser = async (username: string) => {
    const user = await UserService.getByUsername(username);
    if (!user?.id) {
        console.log('user not found');
        return;
    }

    const context: Context = impersonateContext(user);
    await UserAwardService.refreshAwardsFromChallenges(context);
};

const handleCommandSendDailyReminders = async () => {
    await ReminderService.sendDailyReminders(adminContext);
};

const handleCommandSendPeriodicReminders = async () => {
    await ReminderService.sendPeriodicReminders(adminContext);
};

const handleCommandSendDailyWarnings = async () => {
    await ReminderService.sendDailyWarnings(adminContext);
};

const handleCommandSendPeriodicWarnings = async () => {
    await ReminderService.sendPeriodicWarnings(adminContext);
};

const handleCommandSetDefaultSocialNotificationsSettingsForAllUsers = async () => {
    const users = await UserService.getUsersWithoutProperty(
        adminContext,
        Constants.UserPropertyKey.SOCIAL_NOTIFICATIONS_SETTING
    );

    for (const user of users) {
        if (user.id) {
            console.log('setting social notifications for user', user.id);
            UserPropertyService.setSocialNotification(
                adminContext,
                user.id,
                Constants.SocialNotificationSetting.ENABLED
            );
        }
    }
};

const handleCommandSetDefaultReminderNotificationsSettingsForAllUsers = async () => {
    const users = await UserService.getUsersWithoutProperty(
        adminContext,
        Constants.UserPropertyKey.REMINDER_NOTIFICATIONS_SETTING
    );

    for (const user of users) {
        if (user.id) {
            console.log('setting reminder notifications for user', user.id);
            const isPremium = await UserService.isPremium(adminContext, user.id);
            if (isPremium) {
                UserPropertyService.setReminderNotification(
                    adminContext,
                    user.id,
                    Constants.ReminderNotificationSetting.PERIODICALLY
                );
            } else {
                UserPropertyService.setReminderNotification(
                    adminContext,
                    user.id,
                    Constants.ReminderNotificationSetting.DAILY
                );
            }
        }
    }
};

const handleCommandSetDefaultWarmingNotificationsSettingsForAllUsers = async () => {
    const users = await UserService.getUsersWithoutProperty(
        adminContext,
        Constants.UserPropertyKey.WARNING_NOTIFICATIONS_SETTING
    );

    for (const user of users) {
        if (user.id) {
            console.log('setting warning notifications for user', user.id);
            const isPremium = await UserService.isPremium(adminContext, user.id);
            if (isPremium) {
                UserPropertyService.setWarningNotification(
                    adminContext,
                    user.id,
                    Constants.WarningNotificationSetting.PERIODICALLY
                );
            } else {
                UserPropertyService.setWarningNotification(
                    adminContext,
                    user.id,
                    Constants.WarningNotificationSetting.DISABLED
                );
            }
        }
    }
};

const handleCommandRefreshPremiumUsers = async () => {
    await UserService.refreshPremiumUsers(adminContext);
};

const handleCommandRefreshPremiumUser = async (username: string) => {
    const user = await UserDao.getByUsername(username);
    if (!user?.id) {
        console.log('user not found');
        return;
    }

    await UserService.updatePremiumStatus(adminContext, user.uid);
};

const handleAddPremiumRole = async (username: string) => {
    const user = await UserDao.getByUsername(username);
    if (!user?.id) {
        console.log('user not found');
        return;
    }

    await UserRoleService.addUserRole(adminContext, user.email, Role.PREMIUM);
};

const handleRemovePremiumRole = async (username: string) => {
    const user = await UserDao.getByUsername(username);
    if (!user?.id) {
        console.log('user not found');
        return;
    }

    await UserRoleService.removeUserRole(adminContext, user.email, Role.PREMIUM);
};

const handleAddFreeRole = async (username: string) => {
    const user = await UserDao.getByUsername(username);
    if (!user?.id) {
        console.log('user not found');
        return;
    }

    await UserRoleService.addUserRole(adminContext, user.email, Role.FREE);
};

const handleRemoveFreeRole = async (username: string) => {
    const user = await UserDao.getByEmail(username);
    if (!user?.id) {
        console.log('user not found');
        return;
    }

    await UserRoleService.removeUserRole(adminContext, user.email, Role.FREE);
};

const handleCommandCreateChallenge = async () => {
    const request: CreateChallengeFullRequest = {
        challengeFull: {
            challenge: {
                name: 'Walk The Dog',
                description: 'walk the dog every day for a month',
                start: new Date('2024-05-01'),
                end: new Date('2024-06-01'),
            },
            award: {
                name: 'Dog Walked Success',
                description: 'you walked the dog every day for a month!',
                iconId: 127,
            },
            task: {
                title: 'Walk The Dog',
                description: 'woof, woof, woof!',
                iconId: 127,
                // TODO need to add icon
            },
            challengeRequirement: {
                unitId: 1,
                calculationType: ChallengeCalculationType.UNIQUE,
                calculationIntervalDays: 1,
                requiredIntervalQuantity: 30,
                requiredTaskQuantity: 1,
            },
            milestoneKeys: [
                'CHALLENGE_PROGRESS_10',
                'CHALLENGE_PROGRESS_20',
                'CHALLENGE_PROGRESS_30',
            ],
        },
    };

    const challenge = request.challengeFull.challenge;
    const award = request.challengeFull.award;
    const task = request.challengeFull.task;
    const challengeRequirement = request.challengeFull.challengeRequirement;
    const milestoneKeys = request.challengeFull.milestoneKeys;

    const createdChallenge = await ChallengeFullService.create(
        adminContext,
        challenge,
        award,
        task,
        challengeRequirement,
        milestoneKeys
    );
};

const handleCommandCreateIcon = async () => {
    const request: CreateIconRequest = {
        icon: {
            name: 'Budget',
            key: 'BUDGET',
            remoteImageUrl:
                'https://firebasestorage.googleapis.com/v0/b/embtr-app.appspot.com/o/habit_categories%2Fbudget.svg?alt=media',
        },
        tags: ['money', 'finance', 'budget', 'dollar', 'cash', 'coin', 'currency'],
        categories: ['habit'],
    };

    await IconCreationService.create(
        adminContext,
        request.icon,
        request.categories ?? [],
        request.tags ?? []
    );
};

const handleCommandUpdateChallenge = async () => {
    const challengeFull = await ChallengeFullService.get(adminContext, 37);
    console.log('old task name: ', challengeFull.task.title);
    challengeFull.task.title = 'new title name';
    await ChallengeFullService.update(adminContext, 37, challengeFull);
    const updatedChallengeFull = await ChallengeFullService.get(adminContext, 37);
    console.log('new task name: ', updatedChallengeFull.task.title);
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const processCommand = async (command: string) => {
    const [cmd, email] = command.split(' ');

    switch (cmd) {
        case 'exit':
            process.exit(0);

        case 'getProperties':
            await handleCommandGetProperties(email);
            break;

        case 'getRoles':
            await handleCommandGetRoles(email);
            break;

        case 'isAdmin':
            await handleCommandIsAdmin(email);
            break;

        case 'isUser':
            await handleCommandIsUser(email);
            break;

        case 'addAdminRole':
            await handleCommandAddAdminRole(email);
            break;

        case 'addUserRole':
            await handleCommandAddUserRole(email);
            break;

        case 'removeAdminRole':
            await handleCommandRemoveAdminRole(email);
            break;

        case 'addPremiumRole':
            await handleAddPremiumRole(email);
            break;

        case 'removePremiumRole':
            await handleRemovePremiumRole(email);
            break;

        case 'addFreeRole':
            await handleAddFreeRole(email);
            break;

        case 'removeFreeRole':
            await handleRemoveFreeRole(email);
            break;

        case 'removeUserRole':
            await handleCommandRemoveUserRole(email);
            break;

        case 'accountExists':
            await handleAccountExists(email);
            break;

        case 'userExists':
            await handleUserExists(email);
            break;

        case 'revokeToken':
            await handleRevokeToken(email);
            break;

        case 'deleteAccount':
            await AccountService.deleteByEmail(email);
            break;

        case 'deleteUser':
            await UserService.deleteByEmail(email);
            break;

        case 'emailVerified':
            await handleEmailVerified(email);
            break;

        case 'verifyEmail':
            await handleVerifyEmail(email);
            break;

        case 'isPremium':
            await handleCommandIsPremium(email);
            break;

        case 'updateAllUsersPlannedDayStatuses':
            await handleCommandUpdateAllPlannedDayStatusesForAllUsers();
            break;

        case 'updateUserPlannedDayStatuses':
            await handleCommandUpdateAllPlannedDayStatusesForUser(email);
            break;

        case 'updateUserStreaks':
            await handleCommandUpdateUserStreaks(email);
            break;

        case 'updateAllUserStreaks':
            await handleCommandUpdateAllUserStreaks();
            break;

        case 'sendDailyReminders':
            handleCommandSendDailyReminders();
            break;

        case 'sendPeriodicReminders':
            handleCommandSendPeriodicReminders();
            break;

        case 'sendDailyWarnings':
            handleCommandSendDailyWarnings();
            break;

        case 'sendPeriodicWarnings':
            handleCommandSendPeriodicWarnings();
            break;

        case 'sendUserDailyReminders':
            await handleCommandSendUserDailyReminders(email);
            break;

        case 'sendUserPeriodicReminders':
            await handleCommandSendUserPeriodicReminders(email);
            break;

        case 'sendUserDailyWarnings':
            await handleCommandSendUserDailyWarnings(email);
            break;

        case 'sendUserPeriodicWarnings':
            await handleCommandSendUserPeriodicWarnings(email);
            break;

        case 'setDefaultSocial':
            handleCommandSetDefaultSocialNotificationsSettingsForAllUsers();
            break;

        case 'setDefaultReminder':
            handleCommandSetDefaultReminderNotificationsSettingsForAllUsers();
            break;

        case 'setDefaultWarning':
            handleCommandSetDefaultWarmingNotificationsSettingsForAllUsers();
            break;

        case 'refreshPremiumUsers':
            handleCommandRefreshPremiumUsers();
            break;

        case 'refreshPremiumUser':
            await handleCommandRefreshPremiumUser(email);
            break;

        case 'updateAllAwardsForAllUsers':
            await handleCommandUpdateAllAwardsForAllUsers();
            break;

        case 'updateAllAwardsForUser':
            await handleCommandUpdateAllAwardsForUser(email);
            break;

        case 'createChallenge':
            await handleCommandCreateChallenge();
            break;

        case 'createIcon':
            await handleCommandCreateIcon();
            break;

        case 'updateChallenge':
            await handleCommandUpdateChallenge();
            break;

        default:
            console.log('Unknown command.');
    }
};

const startConsole = () => {
    rl.question('Enter command: ', async (command) => {
        await processCommand(command);
        startConsole();
    });
};

startConsole();
