import { UserModel, PlannedDayModel } from '@resources/models';
import { PlannedDay, User } from '@prisma/client';
import { PlannedDayWithUserReturnType } from '@src/controller/PlannedDayController';
import { CreatePlannedDayRequest } from '@resources/types';

export class ModelConverter {
    public static convertUser(user: User): UserModel {
        return {
            uid: user.uid,
            email: user.email,
        };
    }

    public static convertPlannedDayWithUser(plannedDayWithUser: PlannedDayWithUserReturnType): PlannedDayModel {
        if (!plannedDayWithUser) {
            throw new Error('PlannedDay is null');
        }

        return {
            user: this.convertUser(plannedDayWithUser.user),
            dayKey: '',
            date: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
}
