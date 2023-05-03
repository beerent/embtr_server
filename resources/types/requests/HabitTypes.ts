import { Habit } from "../../schema";
import { Response } from "./RequestTypes";

export interface GetAllHabitResonse extends Response {
  habits: Habit[];
}
