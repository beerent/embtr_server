import { Habit } from "../../schema";
import { Response } from "./RequestTypes";
import {HabitJourneys} from '../habit/Habit'

export interface GetAllHabitResonse extends Response {
  habits: Habit[];
}

export interface GetHabitJourneyResponse extends Response {
  habitJourneys?: HabitJourneys;
}
