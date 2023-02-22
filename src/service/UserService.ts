import { GetUserResponse } from '@resources/types';
import { GET_USER_FAILED_NOT_FOUND, GET_USER_SUCCESS } from '@src/common/RequestResponses';
import { UserController } from '@src/controller/UserController';

export class UserService {
    public static async get(uid: string): Promise<GetUserResponse> {
        const user = await UserController.getByUid(uid);
        if (user) {
            return { ...GET_USER_SUCCESS, user: { uid: user.uid, email: user.email } };
        }

        return GET_USER_FAILED_NOT_FOUND;
    }
}
