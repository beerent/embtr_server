import { IconCategory } from '@resources/schema';
import { IconCategoryDao } from '@src/database/IconCategoryDao';
import { Context } from '@src/general/auth/Context';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class IconCategoryService {
    public static async getByName(
        context: Context,
        name: string
    ): Promise<IconCategory | undefined> {
        const iconCategory = await IconCategoryDao.getByName(name);
        if (!iconCategory) {
            return undefined;
        }

        const iconCategoryModel: IconCategory = ModelConverter.convert(iconCategory);
        return iconCategoryModel;
    }

    public static async create(context: Context, name: string): Promise<IconCategory> {
        const iconCategory = await IconCategoryDao.create(name);
        const iconCategoryModel: IconCategory = ModelConverter.convert(iconCategory);
        return iconCategoryModel;
    }

    public static async createAll(
        context: Context,
        iconCategories: string[]
    ): Promise<IconCategory[]> {
        const iconCategoryObjects: IconCategory[] = [];
        for (const iconCategory of iconCategories) {
            const existingIconCategory = await this.getByName(context, iconCategory);
            if (existingIconCategory) {
                iconCategoryObjects.push(existingIconCategory);
                continue;
            }

            const createdIconCategory = await this.create(context, iconCategory);
            iconCategoryObjects.push(createdIconCategory);
        }

        return iconCategoryObjects;
    }
}
