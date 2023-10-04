import { HabitJourney, HabitJourneyElement, HabitJourneys } from '@resources/types/habit/Habit';
import { GetHabitJourneyResponse } from '@resources/types/requests/HabitTypes';
import { GENERAL_FAILURE, SUCCESS } from '@src/common/RequestResponses';
import { UserController } from '@src/controller/UserController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { SeasonController } from '@src/controller/SeasonController';
import { Season } from '@prisma/client';
import {
    HabitJourneyQueryResults,
    PlannedHabitController,
} from '@src/controller/PlannedHabitController';

export class HabitJourneyService {
    public static async get(userId: number): Promise<GetHabitJourneyResponse> {
        const user = await UserController.getById(userId);
        if (!user) {
            return { ...GENERAL_FAILURE, message: 'User not found' };
        }

        const habitJourneyElements = await PlannedHabitController.getHabitJourneys(userId);
        const models: HabitJourney[] = this.createHabitJourneysFromResults(habitJourneyElements);
        const backFilledModels = await this.backFillHabitJourneys(models);
        for (const model of backFilledModels) {
            model.elements.sort((a, b) => a.season - b.season);
        }

        //set the levels for each habit journey
        for (const model of backFilledModels) {
            model.level = this.calculateHabitJourneyLevel(model);
        }

        const habitJourneys: HabitJourneys = {
            user: ModelConverter.convert(user),
            elements: backFilledModels,
        };

        return { ...SUCCESS, habitJourneys };
    }

    private static createHabitJourneysFromResults(habitJourneyResults: HabitJourneyQueryResults) {
        const habitJourneys: HabitJourney[] = [];

        for (const element of habitJourneyResults as any[]) {
            const habitJourneyElement: HabitJourneyElement = {
                season: element.season,
                seasonDate: element.seasonDate,
                daysInSeason: element.daysInSeason,
            };

            let added = false;
            for (const habitJourney of habitJourneys) {
                /*
                if (habitJourney.habit.id === habit.id) {
                    habitJourney.elements.push(habitJourneyElement);
                    added = true;
                    break;
                }
                */
            }

            if (added) {
                continue;
            }

            const habitJourney: HabitJourney = {
                elements: [habitJourneyElement],
                level: 0,
            };
            habitJourneys.push(habitJourney);
        }

        return habitJourneys;
    }

    private static async backFillHabitJourneys(habitJourneys: HabitJourney[]) {
        const seasons: Season[] = await SeasonController.getLastNSeasonsFromDay(12, new Date());
        if (!seasons) {
            return habitJourneys;
        }

        for (const habitJourney of habitJourneys) {
            for (const season of seasons) {
                if (habitJourney.elements.find((element) => element.season === season.id)) {
                    continue;
                }

                const emptyHabitJourneyElement: HabitJourneyElement = {
                    season: season.id,
                    seasonDate: season.date,
                    daysInSeason: 0,
                };

                habitJourney.elements.push(emptyHabitJourneyElement);
            }
        }

        return habitJourneys;
    }

    private static calculateHabitJourneyLevel(habitJourney: HabitJourney) {
        let level = 0;
        for (let i = 0; i < habitJourney.elements.length; i++) {
            const element = habitJourney.elements[i];

            //handle level down
            if (element.daysInSeason <= 3) {
                //do not level down on current season
                if (i === habitJourney.elements.length - 1) {
                    continue;
                }

                if (level > 0) {
                    level -= 1;
                }
            } else {
                level += 1;
            }
        }

        return level;
    }
}
