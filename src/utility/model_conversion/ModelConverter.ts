import { Task, User } from '@prisma/client';
import { PlannedDayModel } from '@resources/models/PlannedDayModel';
import { PlannedTaskModel } from '@resources/models/PlannedTaskModel';
import { TaskModel } from '@resources/models/TaskModel';
import { UserModel } from '@resources/models/UserModel';
import { PlannedDayFull } from '@src/controller/PlannedDayController';
import { PlannedTaskFull } from '@src/controller/PlannedTaskController';

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
            dayKey: plannedDay.dayKey,
            date: plannedDay.date,
            createdAt: plannedDay.createdAt,
            updatedAt: plannedDay.updatedAt,
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
                status: plannedTask.status,
                active: plannedTask.active,
            };

            plannedTaskModels.push(plannedTaskModel);
        });

        return plannedTaskModels;
    }

    public static convertPlannedTask(plannedTask: PlannedTaskFull): PlannedTaskModel {
        if (!plannedTask) {
            throw new Error('PlannedTask is null');
        }

        const plannedDay = structuredClone(plannedTask.plannedDay);

        const plannedTaskModel: PlannedTaskModel = {
            id: plannedTask.id,
            plannedDay: plannedDay,
            task: this.convertTask(plannedTask.task),
            status: plannedTask.status,
            active: plannedTask.active,
        };

        return plannedTaskModel;
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
