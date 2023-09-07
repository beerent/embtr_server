import { Response } from "./RequestTypes";
import {HabitJourneys} from '../habit/Habit'
import { HabitCategory } from "../../schema";

export interface GetAllHabitResonse extends Response {
}

export interface GetHabitJourneyResponse extends Response {
  habitJourneys?: HabitJourneys;
}

export interface GetHabitCategoriesResponse extends Response {
  habitCategories?: HabitCategory[];
}
