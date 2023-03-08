import { UserModel, PlannedDayModel, TaskModel, PlannedTaskModel } from '@resources/models';
import { Task, User } from '@prisma/client';
import { PlannedDayFull, PlannedTaskFull } from '@src/controller/PlannedDayController';

export class ModelConverter {
    public static convertUser(user: User): UserModel {
        return {
            uid: user.uid,
            email: user.email,
        };
    }

    public static convertPlannedDay(plannedDay: PlannedDayFull): PlannedDayModel {
        if (!plannedDay) {
            throw new Error('PlannedDay is null');
        }

        const plannedDayModel: PlannedDayModel = {
            id: plannedDay.id,
            user: this.convertUser(plannedDay.user),
            dayKey: '',
            date: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        plannedDayModel.plannedTasks = this.convertPlannedTasks(plannedDay.plannedTasks, plannedDayModel);

        return plannedDayModel;
    }

    public static convertPlannedTasks(plannedTasks: PlannedTaskFull[], plannedDay: PlannedDayModel): PlannedTaskModel[] {
        const clone = structuredClone(plannedDay);

        const plannedTaskModels: PlannedTaskModel[] = [];
        plannedTasks.forEach((plannedTask) => {
            const plannedTaskModel: PlannedTaskModel = {
                id: plannedTask.id,
                plannedDay: clone,
                task: this.convertTask(plannedTask.task),
            };

            plannedTaskModels.push(plannedTaskModel);
        });

        return plannedTaskModels;
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
