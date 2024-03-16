import { Context } from '@src/general/auth/Context';
import { Property } from '@resources/schema';
import { UserPropertyDao } from '@src/database/UserPropertyDao';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { ServiceException } from '@src/general/exception/ServiceException';
import { Code } from '@resources/codes';

export enum UserPropertyKey {
    HABIT_STREAK_CURRENT = 'HABIT_STREAK_CURRENT',
}

export class UserPropertyService {
    public static async get(
        context: Context,
        userId: number,
        key: string
    ): Promise<Property | undefined> {
        const property = await UserPropertyDao.getByKey(userId, key);
        if (!property) {
            return undefined;
        }

        const propertyModel: Property = ModelConverter.convert(property);
        return propertyModel;
    }

    public static async getAll(context: Context, userId: number): Promise<Property[]> {
        const properties = await UserPropertyDao.getAll(userId);
        const propertyModels: Property[] = ModelConverter.convertAll(properties);

        return propertyModels;
    }

    public static async set(context: Context, property: Property): Promise<Property> {
        if (!property.key || !property.value) {
            throw new ServiceException(
                400,
                Code.INVALID_PROPERTY,
                'invalid create property request'
            );
        }

        const createdProperty = await UserPropertyDao.set(
            context.userId,
            property.key,
            property.value
        );
        const createdPropertyModel: Property = ModelConverter.convert(createdProperty);

        return createdPropertyModel;
    }
}
