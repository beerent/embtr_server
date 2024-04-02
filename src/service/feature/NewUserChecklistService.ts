import { Code } from '@resources/codes';
import { NewUserChecklist, NewUserChecklistElement } from '@resources/types/dto/NewUserChecklist';
import { HttpCode } from '@src/common/RequestResponses';
import { Context } from '@src/general/auth/Context';
import { ServiceException } from '@src/general/exception/ServiceException';
import { PlannedDayResultService } from '../PlannedDayResultService';
import { PlannedDayService } from '../PlannedDayService';
import { PlannedHabitService } from '../PlannedHabitService';
import { ScheduledHabitService } from '../ScheduledHabitService';
import { UserPropertyService } from '../UserPropertyService';
import { UserService } from '../UserService';

export class NewUserChecklistService {
    public static async dismiss(context: Context): Promise<void> {
        await UserPropertyService.setNewUserChecklistDismissed(context);
    }

    public static async complete(context: Context): Promise<void> {
        const checklist = await this.get(context);
        if (checklist.incomplete.length > 0) {
            throw new ServiceException(
                HttpCode.GENERAL_FAILURE,
                Code.INVALID_REQUEST,
                'new user checklist is not complete'
            );
        }

        await UserPropertyService.setNewUserChecklistCompleted(context);
    }

    public static async getIsDismissed(context: Context): Promise<boolean> {
        const dismissed = await UserPropertyService.getNewUserChecklistDismissed(context);
        return dismissed;
    }

    public static async getIsCompleted(context: Context): Promise<boolean> {
        const completed = await UserPropertyService.getNewUserChecklistCompleted(context);
        return completed;
    }

    public static async get(context: Context): Promise<NewUserChecklist> {
        const user = await UserService.get(context, context.userUid);
        if (!user?.id) {
            throw new ServiceException(
                HttpCode.RESOURCE_NOT_FOUND,
                Code.RESOURCE_NOT_FOUND,
                'user not found'
            );
        }

        const complete: NewUserChecklistElement[] = [];
        const incomplete: NewUserChecklistElement[] = [];

        const optionPromises = [
            this.firstHabitCreated(context),
            this.firstHabitCompleted(context),
            this.firstDayCompleted(context),
            this.firstPlannedDayResultShared(context),
        ];
        const options = await Promise.all(optionPromises);

        for (const option of options) {
            if (option.complete) {
                complete.push(option);
            } else {
                incomplete.push(option);
            }
        }

        const checklist: NewUserChecklist = {
            complete,
            incomplete,
        };

        return checklist;
    }

    public static async firstHabitCreated(context: Context): Promise<NewUserChecklistElement> {
        const count = await ScheduledHabitService.count(context);
        const complete = count > 0;

        const element: NewUserChecklistElement = {
            title: 'Create Your First Habit',
            description: 'Start your embtr journey by creating your first habit!',
            tab: 'MY_HABITS',
            steps: ['Click the Add New Habit button'],
            complete,
        };

        return element;
    }

    public static async firstHabitCompleted(context: Context): Promise<NewUserChecklistElement> {
        const complete = await PlannedHabitService.hasCompleted(context);

        const element: NewUserChecklistElement = {
            title: 'Complete Your First Habit',
            description: "It all starts with the first step - Let's complete your first habit!",
            tab: 'TODAY',
            steps: ['Swipe right on your habit to complete it'],
            complete,
        };

        return element;
    }

    public static async firstDayCompleted(context: Context): Promise<NewUserChecklistElement> {
        const count = await PlannedDayService.countComplete(context);
        const complete = count > 0;

        const element: NewUserChecklistElement = {
            title: 'Complete Your First Day',
            description: 'Knock out all of your habits to complete your day!',
            tab: 'TODAY',
            steps: ['Complete each habit for the day'],
            complete,
        };

        return element;
    }

    public static async firstPlannedDayResultShared(
        context: Context
    ): Promise<NewUserChecklistElement> {
        const count = await PlannedDayResultService.count(context);
        const complete = count > 0;

        const element: NewUserChecklistElement = {
            title: 'Share Your First Successful Day',
            description: "You've done it! Let others know by sharing your results!",
            tab: 'TODAY',
            steps: ["Click the 'Share Your Results' button"],
            complete,
        };

        return element;
    }
}
