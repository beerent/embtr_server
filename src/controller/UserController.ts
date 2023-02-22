import { User } from '@prisma/client';
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

    public static async delete(user: User): Promise<User | null> {
        return await prisma.user.delete({
            where: {
                uid: user.uid,
            },
        });
    }

    public static async update(uid: string, email: string): Promise<User | null> {
        const user = await prisma.user.update({
            where: {
                uid: uid,
            },
            data: {
                email: email,
            },
        });

        return user;
    }
}
