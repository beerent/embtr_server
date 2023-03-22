import { User, Task, PlannedDay, PlannedTask, PlannedDayResult, PlannedDayResultImage } from '@prisma/client';

type PrismaModel = User | Task | PlannedDay | PlannedTask | PlannedDayResult | PlannedDayResultImage;

export class ModelConverter {
    public static convert<T>(prismaObj: PrismaModel): T {
        const convertObj = (obj: PrismaModel): T => {
            const convertedObj = obj as any;
            const dateFields = ['createdAt', 'updatedAt'];

            dateFields.forEach((field) => {
                if (convertedObj[field]) {
                    convertedObj[field] = new Date(convertedObj[field]);
                }
            });

            return convertedObj as T;
        };

        return convertObj(prismaObj);
    }

    public static convertAll<T>(prismaObj: PrismaModel[]): T[] {
        const convertObj = (obj: PrismaModel): T => {
            const convertedObj = obj as any;
            const dateFields = ['createdAt', 'updatedAt'];

            dateFields.forEach((field) => {
                if (convertedObj[field]) {
                    convertedObj[field] = new Date(convertedObj[field]);
                }
            });

            return convertedObj as T;
        };

        return prismaObj.map(convertObj);
    }
}
