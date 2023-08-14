import { Response } from "./RequestTypes";
import {HabitJourneys} from '../habit/Habit'

export interface GetAllHabitResonse extends Response {
}

export interface GetHabitJourneyResponse extends Response {
  habitJourneys?: HabitJourneys;
}
