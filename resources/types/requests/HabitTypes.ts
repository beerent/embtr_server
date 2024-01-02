import { Response } from "./RequestTypes";
import { HabitJourneys, HabitSummary } from "../habit/Habit";
import { HabitCategory } from "../../schema";

export interface GetHabitJourneyResponse extends Response {
  habitJourneys?: HabitJourneys;
}

export interface GetHabitCategoriesResponse extends Response {
  habitCategories?: HabitCategory[];
}

export interface GetHabitCategoryResponse extends Response {
  habitCategory?: HabitCategory;
}

export interface GetHabitSummariesResponse extends Response {
  habitSummaries?: HabitSummary[];
}