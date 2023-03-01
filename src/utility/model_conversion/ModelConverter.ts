import { UserModel, PlannedDayModel } from '@resources/models';
import { User } from '@prisma/client';
import { PlannedDayWithUserReturnType } from '@src/controller/PlannedDayController';

export class ModelConverter {
    public static convertUser(user: User): UserModel {
        return {
            uid: user.uid,
            email: user.email,
        };
    }

    public static convertPlannedDay(plannedDay: PlannedDayWithUserReturnType): PlannedDayModel {
        if (!plannedDay) {
            throw new Error('PlannedDay is null');
        }

        return {
            user: this.convertUser(plannedDay.user),
            dayKey: '',
            date: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
}
