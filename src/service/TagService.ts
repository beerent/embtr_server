import { Tag } from '@resources/schema';
import { TagDao } from '@src/database/TagDao';
import { Context } from '@src/general/auth/Context';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class TagService {
    public static async getAll(): Promise<Tag[]> {
        const tags = await TagDao.getAll();

        const tagModels: Tag[] = ModelConverter.convertAll(tags);
        return tagModels;
    }


    public static async getByName(context: Context, name: string): Promise<Tag | undefined> {
        const tag = await TagDao.getByName(name);
        if (!tag) {
            return undefined;
        }

        const tagModel: Tag = ModelConverter.convert(tag);
        return tagModel;
    }

    public static async create(context: Context, name: string): Promise<Tag> {
        const tag = await TagDao.create(name);
        const tagModel: Tag = ModelConverter.convert(tag);
        return tagModel;
    }

    public static async createAll(context: Context, tags: string[]): Promise<Tag[]> {
        const tagObjects: Tag[] = [];
        for (const tag of tags) {
            const existingTag = await this.getByName(context, tag);
            if (existingTag) {
                tagObjects.push(existingTag);
                continue;
            }

            const createdTag = await this.create(context, tag);
            tagObjects.push(createdTag);
        }

        return tagObjects;
    }
}
