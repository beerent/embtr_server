import { Metadata } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';
import { MetadataBody } from '@resources/types/requests/MetadataTypes';
import { MetadataDao } from '@src/database/MetadataDao';
import { Context } from '@src/general/auth/Context';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class MetadataService {
    public static async getAll(context: Context): Promise<Metadata[]> {
        const metadata = await MetadataDao.getAll();
        const metadataModels: Metadata[] = ModelConverter.convertAll(metadata);

        return metadataModels;
    }

    public static async getDataDrivenDetailsVersion(context: Context): Promise<number> {
        const dataDrivenDetailsVersion = await this.getByKey(
            Constants.MetadataKey.DATA_DRIVEN_DETAILS_VERSION
        );

        if (!dataDrivenDetailsVersion) {
            throw new Error('Data driven details version not found');
        }

        return parseInt(dataDrivenDetailsVersion.value ?? '0');
    }

    private static async getByKey(key: Constants.MetadataKey): Promise<Metadata | undefined> {
        const metadata = await MetadataDao.get(key);
        if (!metadata) {
            return undefined;
        }

        const metadataModel: Metadata = ModelConverter.convert(metadata);
        return metadataModel;
    }

    public static async create(key: string, value: string): Promise<Metadata> {
        const metadata = await MetadataDao.create(key, value);
        const metadataModel: Metadata = ModelConverter.convert(metadata);

        return metadataModel;
    }

    public static async update(id: number, data: MetadataBody): Promise<Metadata> {
        const metadata = await MetadataDao.update(id, data);
        const metadataModel: Metadata = ModelConverter.convert(metadata);

        return metadataModel;
    }

    public static async delete(id: number): Promise<void> {
        await MetadataDao.delete(id);
    }
}
