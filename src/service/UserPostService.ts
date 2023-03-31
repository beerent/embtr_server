import { UserPost as UserPostModel } from '@resources/schema';
import { GetUserPostResponse } from '@resources/types/UserPostTypes';
import { RESOURCE_NOT_FOUND, SUCCESS } from '@src/common/RequestResponses';
import { UserPostController } from '@src/controller/UserPostController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class UserPostService {
    public static async getById(id: number): Promise<GetUserPostResponse> {
        const userPost = await UserPostController.getById(id);

        if (userPost) {
            const convertedDayResult: UserPostModel = ModelConverter.convert(userPost);
            return { ...SUCCESS, UserPost: convertedDayResult };
        }

        return RESOURCE_NOT_FOUND;
    }
}
