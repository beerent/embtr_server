import { User } from '@prisma/client';
import { prisma } from '@database/prisma';
import { UserModel } from '@resources/models';

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
        const updatedUser = await prisma.user.update({
            where: {
                uid: uid,
            },
            data: {
                ...user,
            },
        });

        return updatedUser;
    }
}
