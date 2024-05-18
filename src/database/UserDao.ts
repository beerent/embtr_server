import { Prisma, User } from '@prisma/client';
import { User as UserModel } from '@resources/schema';
import { prisma } from '@database/prisma';
import { Constants } from '@resources/types/constants/constants';
import { Role } from '@src/roles/Roles';

export class UserDao {
    public static async getByUid(uid: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: {
                uid: uid,
            },
            include: {
                roles: true,
            },
        });

        return user;
    }

    public static async existsByEmail(email: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        return !!user;
    }

    public static async existsById(id: number): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: {
                id: id,
            },
        });

        return !!user;
    }

    public static async existsByUsername(username: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: {
                username: username,
            },
        });

        return !!user;
    }

    public static async getByEmail(email: string) {
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
            include: {
                roles: true,
            },
        });

        return user;
    }

    public static async getAll(query?: Record<string, string>): Promise<User[]> {
        const users = await prisma.user.findMany({
            ...(query?.limit && {
               take: Number(query.limit)
            }),
            ...(query?.sort && {
               orderBy: [
                  {
                    createdAt: query.sort as Prisma.SortOrder
                  }
               ]
            })
        });
        return users;
    }

    public static async getAllUserCount(): Promise<number> {
        const count = await prisma.user.count();
        return count;
    }

    public static async getAllPremiumUserCount(): Promise<number> {
        const count = await prisma.user.count({
            where: {
                roles: {
                    some: {
                        name: "premium"
                    },
                },
            },
        });
        return count;
    }

    public static async existsByUid(uid: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: {
                uid: uid,
            },
        });

        return !!user;
    }

    public static async getById(id: number) {
        const user = await prisma.user.findUnique({
            where: {
                id: id,
            },
            include: {
                roles: true,
            },
        });

        return user;
    }

    public static async getByUsername(username: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: {
                username: username,
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
        await prisma.user.delete({
            where: {
                email: email,
            },
        });
    }

    public static async update(uid: string, user: UserModel): Promise<User | null> {
        const username = user.username !== undefined ? { username: user.username.trim() } : {};
        const displayName =
            user.displayName !== undefined ? { displayName: user.displayName.trim() } : {};
        const bio = user.bio !== undefined ? { bio: user.bio.trim() } : {};
        const location = user.location !== undefined ? { location: user.location.trim() } : {};
        const photoUrl = user.photoUrl !== undefined ? { photoUrl: user.photoUrl } : {};
        const bannerUrl = user.bannerUrl !== undefined ? { bannerUrl: user.bannerUrl } : {};
        const accountSetup =
            user.accountSetup !== undefined ? { accountSetup: user.accountSetup } : {};
        const termsVersion =
            user.termsVersion !== undefined ? { termsVersion: user.termsVersion } : {};

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
                ...accountSetup,
                ...termsVersion,
            },
        });

        return updatedUser;
    }

    public static async addUserRole(uid: string, roleId: number) {
        const updatedUser = await prisma.user.update({
            where: {
                uid: uid,
            },
            data: {
                roles: {
                    connect: {
                        id: roleId,
                    },
                },
            },
        });

        return updatedUser;
    }

    public static async addUserRoles(uid: string, roleIds: number[]) {
        const updatedUser = await prisma.user.update({
            where: {
                uid: uid,
            },
            data: {
                roles: {
                    connect: roleIds.map((id) => {
                        return {
                            id: id,
                        };
                    }),
                },
            },
        });

        return updatedUser;
    }

    public static async removeUserRole(uid: string, roleId: number) {
        const updatedUser = await prisma.user.update({
            where: {
                uid: uid,
            },
            data: {
                roles: {
                    disconnect: {
                        id: roleId,
                    },
                },
            },
        });

        return updatedUser;
    }

    public static async removeUserRoles(uid: string, roleIds: number[]) {
        const updatedUser = await prisma.user.update({
            where: {
                uid: uid,
            },
            data: {
                roles: {
                    disconnect: roleIds.map((id) => {
                        return {
                            id: id,
                        };
                    }),
                },
            },
        });

        return updatedUser;
    }

    public static async getUsersWithRole(
        role: Role
    ): Promise<User[]> {
        const users = await prisma.user.findMany({
            where: {
                roles: {
                    some: {
                        name: role
                    },
                },
            },
            include: {
                roles: true,
            },
        });

        return users;
    }

    public static async getUsersWithProperty(
        key: Constants.UserPropertyKey,
        value: string
    ): Promise<User[]> {
        const users = await prisma.user.findMany({
            where: {
                properties: {
                    some: {
                        key: key,
                        value: value,
                    },
                },
            },
            include: {
                properties: true,
                pushNotificationTokens: true,
            },
        });

        return users;
    }

    public static async getUsersWithoutProperty(key: Constants.UserPropertyKey): Promise<User[]> {
        const users = await prisma.user.findMany({
            where: {
                properties: {
                    none: {
                        key: key,
                    },
                },
            },
            include: {
                properties: true,
                pushNotificationTokens: true,
            },
        });

        return users;
    }
}
