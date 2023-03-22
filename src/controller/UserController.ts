import { User } from '@prisma/client';
import { User as UserModel } from '@resources/schema';
import { prisma } from '@database/prisma';

export class UserController {
    public static async getByUid(uid: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: {
                uid: uid,
            },
        });

        return user;
    }

    public static async create(uid: string, email: string): Promise<User | null> {
        const newUser = await prisma.user.create({
            data: {
                uid: uid,
                email: email,
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
            },
        });

        return updatedUser;
    }
}
