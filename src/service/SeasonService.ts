import { SeasonController } from '@src/controller/SeasonController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class SeasonService {
    public static async getCurrentSeason() {
        const currentSeason = await SeasonController.getSeasonForDay(new Date());
        if (!currentSeason) {
            return null;
        }

        const model = ModelConverter.convert(currentSeason);
        return model;
    }
}