import { User } from '@prisma/client';
import { User as UserModel } from '@resources/schema';
import { prisma } from '@database/prisma';
import { PushNotificationController } from './PushNotificationController';

export class UserController {
    public static async getByUid(uid: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: {
                uid: uid,
            },
        });

        return user;
    }

    public static async getById(id: number): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: {
                id: id,
            },
        });

        return user;
    }

    public static async search(query: string): Promise<User[]> {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    {
                        username: {
                            contains: query,
                        },
                    },
                    {
                        displayName: {
                            contains: query,
                        },
                    },
                ],
            },
        });

        return users;
    }

    public static async create(uid: string, email: string): Promise<User | null> {
        const newUser = await prisma.user.create({
            data: {
                uid: uid,
                email: email,
                username: 'new user',
                displayName: 'new user',
                bio: 'welcome to embtr!',
                location: 'earth',
                photoUrl:
                    'https://firebasestorage.googleapis.com/v0/b/embtr-app.appspot.com/o/common%2Fdefault_profile.png?alt=media&token=ff2e0e76-dc26-43f3-9354-9a14a240dcd6',
            },
        });

        return newUser;
    }

    public static async deleteByUid(uid: string): Promise<User | null> {
        return await prisma.user.delete({
            where: {
                uid: uid,
            },
        });
    }

    public static async deleteByEmail(email: string): Promise<void> {
        await prisma.user.deleteMany({
            where: {
                email: email,
            },
        });
    }

    public static async update(uid: string, user: UserModel): Promise<User | null> {
        const username = user.username !== undefined ? { username: user.username } : {};
        const displayName = user.displayName !== undefined ? { displayName: user.displayName } : {};
        const bio = user.bio !== undefined ? { bio: user.bio } : {};
        const location = user.location !== undefined ? { location: user.location } : {};
        const photoUrl = user.photoUrl !== undefined ? { photoUrl: user.photoUrl } : {};
        const bannerUrl = user.bannerUrl !== undefined ? { bannerUrl: user.bannerUrl } : {};
        const pushNotificationTokens = await UserController.createUserPushNotification(user);

        const updatedUser = await prisma.user.update({
            where: {
                uid: uid,
            },
            data: {
                ...username,
                ...displayName,
                ...bio,
                ...location,
                ...photoUrl,
                ...bannerUrl,
                pushNotificationTokens,
            },
        });

        return updatedUser;
    }

    private static async createUserPushNotification(user: UserModel) {
        const potentialTokensToAdd = user.pushNotificationTokens;
        if (!potentialTokensToAdd) {
            return {};
        }

        if (!user.uid) {
            return {};
        }

        const existingUserTokens = await PushNotificationController.getByUid(user.uid);
        const tokensToAdd = potentialTokensToAdd.filter((token) => {
            return !existingUserTokens.some((userToken) => userToken.token === token.token);
        });

        if (tokensToAdd.length === 0) {
            return {};
        }

        return {
            upsert: tokensToAdd
                ?.filter((token) => token.token !== undefined)
                .map((token) => ({
                    where: { id: token.id ?? -1 },
                    create: { token: token.token! },
                    update: { token: token.token!, active: token.active ?? true },
                })),
        };
    }
}
