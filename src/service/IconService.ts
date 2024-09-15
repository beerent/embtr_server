import { Code } from '@resources/codes';
import { Icon, Tag, IconCategory } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';
import { UpdateIconData } from '@resources/types/requests/IconTypes';
import { HttpCode } from '@src/common/RequestResponses';
import { IconDao } from '@src/database/IconDao';
import { Context } from '@src/general/auth/Context';
import { ServiceException } from '@src/general/exception/ServiceException';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { IconCategoryService } from './IconCategoryService';
import { TagService } from './TagService';

export class IconService {
    public static async getByKey(context: Context, key: string): Promise<Icon> {
        const icon = await IconDao.getByKey(key);
        if (!icon) {
            throw new ServiceException(
                HttpCode.RESOURCE_NOT_FOUND,
                Code.RESOURCE_NOT_FOUND,
                'Icon not found'
            );
        }

        const iconModel: Icon = ModelConverter.convert(icon);
        return iconModel;
    }

    public static async get(context: Context, id: number): Promise<Icon> {
        const icon = await IconDao.get(id);
        if (!icon) {
            throw new ServiceException(
                HttpCode.RESOURCE_NOT_FOUND,
                Code.RESOURCE_NOT_FOUND,
                'Icon not found'
            );
        }

        const iconModel: Icon = ModelConverter.convert(icon);
        return iconModel;
    }

    public static async getAll(): Promise<Icon[]> {
        const icons = await IconDao.getAll();
        const iconModel: Icon[] = ModelConverter.convertAll(icons);

        return iconModel;
    }

    public static async getAllByCategory(context: Context, category: string): Promise<Icon[]> {
        const icons = await IconDao.getAllByCategory(category);
        if (!icons) {
            return [];
        }

        const iconModels: Icon[] = ModelConverter.convertAll(icons);
        return iconModels;
    }

    public static async create(context: Context, icon: Icon): Promise<Icon> {
        const createdIcon = await IconDao.create(icon);
        if (!createdIcon) {
            throw new ServiceException(
                HttpCode.GENERAL_FAILURE,
                Code.GENERIC_ERROR,
                'Failed to create icon'
            );
        }

        const createdIconModel: Icon = ModelConverter.convert(createdIcon);
        return createdIconModel;
    }

    public static async update(
        context: Context,
        iconId: number,
        data: UpdateIconData
    ): Promise<Icon> {
        let updatedIcon = await IconDao.update(iconId, {
            name: data.name,
            remoteImageUrl: data.remoteImageUrl,
            localImage: data.localImage,
        });

        if (!updatedIcon) {
            throw new ServiceException(
                HttpCode.GENERAL_FAILURE,
                Code.GENERIC_ERROR,
                'Failed to update icon'
            );
        }

        if (data.tags) {
            await IconService.addTags(context, updatedIcon.id, data.tags);
        } else {
            await IconService.removeAllTags(iconId);
        }

        if (data.categories) {
            await IconService.addCategories(context, updatedIcon.id, data.categories);
        } else {
            await IconService.removeAllCategories(iconId);
        }

        const icon = await this.get(context, iconId);
        return icon;
    }

    public static async delete(iconId: number): Promise<void> {
        await IconDao.delete(iconId);
    }

    public static async addTags(context: Context, iconId: number, tags: string[]): Promise<void> {
        const tagObjects: Tag[] = await TagService.createAll(
            context,
            Constants.TagCategory.ICON,
            tags
        );
        const tagIds = tagObjects.flatMap((tag) => (tag.id ? [tag.id] : []));
        await IconDao.removeAllTags(iconId);
        await IconDao.addTags(iconId, tagIds);
    }

    public static async removeAllTags(iconId: number): Promise<void> {
        await IconDao.removeAllTags(iconId);
    }

    public static async addCategories(
        context: Context,
        iconId: number,
        categories: string[]
    ): Promise<void> {
        const categoryObjects: IconCategory[] = await IconCategoryService.createAll(
            context,
            categories
        );
        const iconCategoryIds = categoryObjects.flatMap((category) =>
            category.id ? [category.id] : []
        );
        await IconDao.removeAllCategories(iconId);
        await IconDao.addCategories(iconId, iconCategoryIds);
    }

    public static async removeAllCategories(iconId: number): Promise<void> {
        await IconDao.removeAllCategories(iconId);
    }
}
