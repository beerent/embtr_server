import { Habit } from '@resources/schema';
import { HabitJourney, HabitJourneys } from '@resources/types/habit/Habit';
import { GetHabitJourneyResponse } from '@resources/types/requests/HabitTypes';
import { GENERAL_FAILURE, SUCCESS } from '@src/common/RequestResponses';
import {
    HabitJourneyQueryResults,
    PlannedTaskController,
} from '@src/controller/PlannedTaskController';
import { UserController } from '@src/controller/UserController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class HabitJourneyService {
    public static async get(userId: number): Promise<GetHabitJourneyResponse> {
        const user = await UserController.getById(userId);
        if (!user) {
            return { ...GENERAL_FAILURE, message: 'User not found' };
        }

        const habitJourneyElements = await PlannedTaskController.getHabitJourneys(userId);
        const models = this.createHabitJourneysFromResults(habitJourneyElements);

        const habitJourneys: HabitJourneys = {
            user: ModelConverter.convert(user),
            elements: models,
        };

        return { ...SUCCESS, habitJourneys };
    }

    public static createHabitJourneysFromResults(habitJourneyResults: HabitJourneyQueryResults) {
        const habitJourneys: HabitJourney[] = [];

        for (const element of habitJourneyResults as any[]) {
            const habit: Habit = {
                id: element.habitId,
                title: element.habitTitle,
                iconName: element.iconName,
                iconSource: element.iconSource,
            };

            let added = false;
            for (const habitJourney of habitJourneys) {
                if (habitJourney.habit.id === habit.id) {
                    habitJourney.elements.push(element);
                    added = true;
                    break;
                }
            }

            if (added) {
                continue;
            }

            const habitJourney: HabitJourney = {
                habit,
                elements: [element],
            };
            habitJourneys.push(habitJourney);
        }

        return habitJourneys;
    }
}
