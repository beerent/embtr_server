import { PlannedDayResultImage, Task, User } from '@prisma/client';
import { PlannedDayResultModel } from '@resources/models/PlannedDayResultModel';
import { PlannedDayModel } from '@resources/models/PlannedDayModel';
import { PlannedTaskModel } from '@resources/models/PlannedTaskModel';
import { TaskModel } from '@resources/models/TaskModel';
import { UserModel } from '@resources/models/UserModel';
import { PlannedDayFull } from '@src/controller/PlannedDayController';
import { PlannedDayResultFull } from '@src/controller/PlannedDayResultController';
import { PlannedTaskFull } from '@src/controller/PlannedTaskController';
import { PlannedDayResultImageModel } from '@resources/models/PlannedDayResultImageModel';

export class ModelConverter {
    public static convertUser(user: User): UserModel {
        return {
            uid: user.uid,
            email: user.email,
            location: user.location ?? undefined,
            bio: user.bio ?? undefined,
            displayName: user.displayName ?? undefined,
            username: user.username ?? undefined,
            photoUrl: user.photoUrl ?? undefined,
            bannerUrl: user.bannerUrl ?? undefined,
        };
    }

    public static convertPlannedDayResults(plannedDayResults: PlannedDayResultFull[]): PlannedDayResultModel[] {
        return plannedDayResults.map((dayResult) => this.convertPlannedDayResult(dayResult));
    }

    public static convertPlannedDayResult(plannedDayResult: PlannedDayResultFull): PlannedDayResultModel {
        if (!plannedDayResult) {
            throw new Error('DayResult is null');
        }

        const dayResultModel: PlannedDayResultModel = {
            id: plannedDayResult.id,
            plannedDay: this.convertPlannedDay(plannedDayResult.plannedDay),
            description: plannedDayResult.description ?? undefined,
            createdAt: plannedDayResult.createdAt,
            updatedAt: plannedDayResult.updatedAt,
        };

        dayResultModel.plannedDayResultImages = this.convertPlannedDayResultImages(plannedDayResult.plannedDayResultImages, dayResultModel);

        return dayResultModel;
    }

    public static convertPlannedDayResultImages(
        plannedDayResultImages: PlannedDayResultImage[],
        plannedDayResult: PlannedDayResultModel
    ): PlannedDayResultImageModel[] {
        return plannedDayResultImages.map((image) => this.convertPlannedDayResultImage(image, plannedDayResult));
    }

    public static convertPlannedDayResultImage(
        plannedDayResultImage: PlannedDayResultImage,
        plannedDayResult: PlannedDayResultModel
    ): PlannedDayResultImageModel {
        const clone = structuredClone(plannedDayResult);

        return {
            id: plannedDayResultImage.id,
            url: plannedDayResultImage.url,
            plannedDayResult: clone,
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
