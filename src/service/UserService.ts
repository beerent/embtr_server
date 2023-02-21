import { GetUserResponse } from '@resources/types';
import { GET_USER_SUCCESS } from '@src/common/RequestResponses';

export class UserService {
    public static async get(uid: string): Promise<GetUserResponse> {
        return { ...GET_USER_SUCCESS, user: { uid, email: '' } };
    }
}
