import { Feature } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';
import { DetailedFeature } from '@resources/types/dto/Feature';
import { FeatureDao } from '@src/database/FeatureDao';
import { Context } from '@src/general/auth/Context';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { UserPropertyService } from './UserPropertyService';

// "Look at me, I'm the captain now" - jeroenvanwissen - 2024-08-07
// eslint-disable-next-line //@ts-ignore. - TheIbraDev - 2024-08-07
// "Common misconception: Twitch stole from us, we didn't steal from Twitch" - TheCaptainCoder - 2024-08-08

export class FeatureService {
    public static async getAll(context: Context): Promise<Feature[]> {
        const features = await FeatureDao.getAll();
        const featureModels: Feature[] = ModelConverter.convertAll(features);

        return featureModels;
    }

    public static async getAllDetailed(context: Context): Promise<DetailedFeature[]> {
        const features = await this.getAll(context);
        const votesMap = await UserPropertyService.countVotesByKey(
            context,
            Constants.UserPropertyKey.FEATURE_VOTE
        );

        const detailedFeatures: DetailedFeature[] = [];
        features.forEach((feature: Feature) => {
            if (!feature.id) {
                return;
            }

            const votes: number = votesMap[feature.id.toString()] || 0;
            const detailedFeature: DetailedFeature = {
                id: feature.id,
                name: feature.name ?? '',
                status: feature.status ?? '',
                description: feature.description ?? '',
                votes: votes,
            };

            detailedFeatures.push(detailedFeature);
        });

        return detailedFeatures;
    }

    public static async getUserVote(context: Context): Promise<Feature | undefined> {
        const userFeatureVoteId = await UserPropertyService.getFeatureVote(context);
        if (!userFeatureVoteId) {
            return undefined;
        }

        const feature = await FeatureDao.getById(userFeatureVoteId);
        if (!feature) {
            return undefined;
        }

        const featureModel: Feature = ModelConverter.convert(feature);
        return featureModel;
    }

    public static async get(context: Context, featureId: number): Promise<Feature | undefined> {
        const feature = await FeatureDao.getById(featureId);
        if (!feature) {
            return undefined;
        }

        const featureModel: Feature = ModelConverter.convert(feature);
        return featureModel;
    }

    public static async vote(context: Context, featureId: number) {
        const feature = await FeatureDao.getById(featureId);
        if (!feature) {
            throw new Error('Feature not found');
        }

        await UserPropertyService.setFeatureVote(context, featureId);
    }

    public static async countVotes() {
        UserPropertyService;
    }
}
