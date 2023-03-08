import { UserModel, PlannedDayModel, TaskModel } from '@resources/models';
import { Task, User } from '@prisma/client';
import { PlannedDayWithUserReturnType } from '@src/controller/PlannedDayController';

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
            id: plannedDayWithUser.id,
            user: this.convertUser(plannedDayWithUser.user),
            dayKey: '',
            date: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    public static convertTasks(tasks: Task[]): TaskModel[] {
        return tasks.map((task) => {
            return {
                id: task.id,
                title: task.title,
                description: task.description,
            };
        });
    }

    public static convertTask(task: Task): TaskModel {
        return {
            id: task.id,
            title: task.title,
            description: task.description,
        };
    }
}
