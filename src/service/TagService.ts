import { Tag } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';
import { TagDao } from '@src/database/TagDao';
import { Context, UserContext } from '@src/general/auth/Context';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class TagService {
    public static async getAll(): Promise<Tag[]> {
        const tags = await TagDao.getAll();

        const tagModels: Tag[] = ModelConverter.convertAll(tags);
        return tagModels;
    }

    public static async getAllByCategory(
        context: UserContext,
        category: Constants.TagCategory
    ): Promise<Tag[]> {
        const tags = await TagDao.getAllByCategory(category);

        const tagModels: Tag[] = ModelConverter.convertAll(tags);
        return tagModels;
    }

    public static async getByCategoryAndName(
        context: Context,
        category: Constants.TagCategory,
        name: string
    ): Promise<Tag | undefined> {
        const tag = await TagDao.getByCategoryAndName(category, name);
        if (!tag) {
            return undefined;
        }

        const tagModel: Tag = ModelConverter.convert(tag);
        return tagModel;
    }

    public static async create(
        context: Context,
        category: Constants.TagCategory,
        name: string
    ): Promise<Tag> {
        const tag = await TagDao.create(category, name);
        const tagModel: Tag = ModelConverter.convert(tag);
        return tagModel;
    }

    public static async getOrCreate(
        context: Context,
        category: Constants.TagCategory,
        name: string
    ): Promise<Tag> {
        const existingTag = await this.getByCategoryAndName(context, category, name);
        if (existingTag) {
            return existingTag;
        }

        const createdTag = await this.create(context, category, name);
        return createdTag;
    }

    public static async createAll(
        context: Context,
        category: Constants.TagCategory,
        tags: string[]
    ): Promise<Tag[]> {
        const tagObjects: Tag[] = [];
        for (const tag of tags) {
            const existingTag = await this.getByCategoryAndName(context, category, tag);
            if (existingTag) {
                tagObjects.push(existingTag);
                continue;
            }

            const createdTag = await this.create(context, category, tag);
            tagObjects.push(createdTag);
        }

        return tagObjects;
    }
}
