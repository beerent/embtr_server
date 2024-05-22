import { Icon } from '@resources/schema';
import { IconDao } from '@src/database/IconDao';
import { Context } from '@src/general/auth/Context';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export enum IconCategory {
    HABIT = 'HABIT',
}

export class IconService {
    public static async getAllByCategory(
        context: Context,
        category: IconCategory
    ): Promise<Icon[]> {
        const icons = await IconDao.getAllByCategory(category);
        if (!icons) {
            return [];
        }

        const iconModels: Icon[] = ModelConverter.convertAll(icons);
        console.log('iconModels', iconModels);
        return iconModels;
    }
}
