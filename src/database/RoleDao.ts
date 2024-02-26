import { prisma } from '@database/prisma';

export class RoleDao {
    public static async get(name: string) {
        return await prisma.role.findUnique({
            where: {
                name: name,
            },
        });
    }
}
