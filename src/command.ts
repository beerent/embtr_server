process.env.TZ = 'UTC';
require('module-alias/register');

import * as readline from 'readline';
import { UserRoleService } from './service/UserRoleService';
import { Context } from './general/auth/Context';
import { Role } from './roles/Roles';
import { AccountService } from './service/AccountService';
import { UserService } from './service/UserService';

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

const handleCommandSetAdminRole = async (email: string) => {
    if (email) {
        await UserRoleService.setUserRole(adminContext, email, Role.ADMIN);
    }
};

const handleCommandSetUserRole = async (email: string) => {
    if (email) {
        await UserRoleService.setUserRole(adminContext, email, Role.USER);
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
    } catch (error) {}
};

const handleRevokeToken = async (email: string) => {
    try {
        const account = await AccountService.get(adminContext, email);
        if (account) {
            await AccountService.revokeToken(email);
        }
    } catch (error) {}
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

        case 'setAdminRole':
            await handleCommandSetAdminRole(email);
            break;

        case 'setUserRole':
            await handleCommandSetUserRole(email);
            break;

        case 'removeAdminRole':
            await handleCommandRemoveAdminRole(email);
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