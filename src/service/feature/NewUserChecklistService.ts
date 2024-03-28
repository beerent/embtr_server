import { Code } from '@resources/codes';
import { Property, User } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';
import { NewUserChecklist, NewUserChecklistElement } from '@resources/types/dto/NewUserChecklist';
import { HttpCode } from '@src/common/RequestResponses';
import { Context } from '@src/general/auth/Context';
import { ServiceException } from '@src/general/exception/ServiceException';
import { PlannedDayResultService } from '../PlannedDayResultService';
import { PlannedDayService } from '../PlannedDayService';
import { PlannedHabitService } from '../PlannedHabitService';
import { QuoteOfTheDayService } from '../QuoteOfTheDayService';
import { UserPostService } from '../UserPostService';
import { UserPropertyService } from '../UserPropertyService';
import { UserService } from '../UserService';

export class NewUserChecklistService {
    public static async dismiss(context: Context): Promise<void> {
        const property: Property = {
            key: Constants.UserPropertyKey.NEW_USER_CHECKLIST_DISMISSED,
            value: context.dayKey,
        };

        await UserPropertyService.set(context, context.userId, property);
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

        const property: Property = {
            key: Constants.UserPropertyKey.NEW_USER_CHECKLIST_COMPLETED,
            value: context.dayKey,
        };

        await UserPropertyService.set(context, context.userId, property);
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
            this.profileIsSetup(user),
            this.firstHabitCreated(context),
            this.firstDayCompleted(context),
            this.firstPostShared(context),
            this.firstPlannedDayResultShared(context),
            this.firstQuoteOfTheDayAdded(context),
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

    private static async profileIsSetup(user: User): Promise<NewUserChecklistElement> {
        const complete =
            !!user.username &&
            !!user.displayName &&
            !!user.bio &&
            user.bio !== 'welcome to embtr!' &&
            user.photoUrl !== null &&
            !user.photoUrl?.includes('default');

        const element: NewUserChecklistElement = {
            title: 'Setup Your Profile',
            description: 'Setup your profile to add a personal touch to your space!',
            complete,
        };

        return element;
    }

    public static async firstHabitCreated(context: Context): Promise<NewUserChecklistElement> {
        const count = await PlannedHabitService.count(context);
        const complete = count > 0;

        const element: NewUserChecklistElement = {
            title: 'Create Your First Habit',
            description: 'Start your journey by creating your first habit!',
            complete,
        };

        return element;
    }

    public static async firstDayCompleted(context: Context): Promise<NewUserChecklistElement> {
        const count = await PlannedDayService.countComplete(context);
        const complete = count > 0;

        const element: NewUserChecklistElement = {
            title: 'Complete Your First Day',
            description: 'Start your habit streak by completing your first day!',
            complete,
        };

        return element;
    }

    public static async firstPostShared(context: Context): Promise<NewUserChecklistElement> {
        const count = await UserPostService.count(context);
        const complete = count > 0;

        const element: NewUserChecklistElement = {
            title: 'Share Your First Post',
            description: 'Share your first post to start your journey!',
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
            title: 'Share Your First Day Result',
            description: 'Share your first day result to start your journey!',
            complete,
        };

        return element;
    }

    public static async firstQuoteOfTheDayAdded(
        context: Context
    ): Promise<NewUserChecklistElement> {
        const count = await QuoteOfTheDayService.count(context);
        const complete = count > 0;

        const element: NewUserChecklistElement = {
            title: 'Add Your First Quote of the Day',
            description: 'Inspire others by sharing your first quote of the day!',
            complete,
        };

        return element;
    }
}
