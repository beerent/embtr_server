import { AuthorizationController } from '@src/controller/AuthorizationController';
import { Context } from '@src/general/auth/Context';
import { Request } from 'express';

export class ContextService {
    public static async get(request: Request): Promise<Context> {
        const userId: number = (await AuthorizationController.getUserIdFromToken(
            request.headers.authorization!
        )) as number;

        if (!userId) {
            throw new Error('ContextService: invalid state');
        }

        return {
            userId,
        };
    }
}
