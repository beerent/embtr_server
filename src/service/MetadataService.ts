import { Metadata } from '@resources/schema';
import { MetadataDao } from '@src/database/MetadataDao';
import { Context } from '@src/general/auth/Context';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class MetadataService {
    public static async getAll(context: Context): Promise<Metadata[]> {
        const metadata = await MetadataDao.getAll();
        const metadataModels : Metadata[] = ModelConverter.convertAll(metadata);

        return metadataModels;
    }
}
