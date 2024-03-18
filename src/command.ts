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

const adminContext: Context = {
    userId: 1,
    userUid: 'hello',
    userEmail: 'bnren',
    userRoles: [],
};

const handleCommandGetRoles = async (email: string) => {
    try {
        const roles = await UserRoleService.getRoles(email);
        console.log(roles);
    } catch (error) {
        console.log('[]');
    }
};

const handleCommandIsAdmin = async (email: string) => {
    try {
        const isAdmin = await UserRoleService.isAdmin(email);
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
    if (email) {
        await UserRoleService.addUserRole(adminContext, email, Role.ADMIN);
    }
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

const handleCommandIsPremium = async (email: string) => {
    try {
        const user = await UserService.getByEmail(email);
        if (!user.uid) {
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

const handleCommandUpdateUserStreaks = async (email: string) => {
    const user = await UserService.getByUsername(email);
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

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const processCommand = async (command: string) => {
    const [cmd, email] = command.split(' ');

    switch (cmd) {
        case 'exit':
            process.exit(0);

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
            await UserRoleService.addUserRole(adminContext, email, Role.PREMIUM);
            break;
        case 'removePremiumRole':
            await UserRoleService.removeUserRole(adminContext, email, Role.PREMIUM);
            break;

        case 'addFreeRole':
            await UserRoleService.addUserRole(adminContext, email, Role.FREE);
            break;

        case 'removeFreeRole':
            await UserRoleService.removeUserRole(adminContext, email, Role.FREE);
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
