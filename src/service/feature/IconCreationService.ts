import { Code } from '@resources/codes';
import { Icon } from '@resources/schema';
import { HttpCode } from '@src/common/RequestResponses';
import { Context } from '@src/general/auth/Context';
import { ServiceException } from '@src/general/exception/ServiceException';
import { IconService } from '../IconService';

export class IconCreationService {
    public static async create(
        context: Context,
        icon: Icon,
        categories: string[],
        tags: string[]
    ): Promise<Icon> {
        const createdIcon: Icon = await IconService.create(context, icon);
        if (!createdIcon.id) {
            throw new ServiceException(
                HttpCode.GENERAL_FAILURE,
                Code.GENERIC_ERROR,
                'Failed to create icon'
            );
        }

        await IconService.addTags(context, createdIcon.id, tags);
        await IconService.addCategories(context, createdIcon.id, categories);

        const completeIcon = await IconService.get(context, createdIcon.id);
        return completeIcon;
    }
}
