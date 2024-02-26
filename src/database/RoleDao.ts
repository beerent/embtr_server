import { prisma } from '@database/prisma';

export class RoleDao {
    public static async getByName(name: string) {
        return await prisma.role.findUnique({
            where: {
                name: name,
            },
        });
    }

    public static async getAllByName(names: string[]) {
        return await prisma.role.findMany({
            where: {
                name: {
                    in: names,
                },
            },
        });
    }
}
