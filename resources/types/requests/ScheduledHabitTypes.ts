import { Response } from "./RequestTypes";
import { ScheduledHabit } from "../../schema";

export interface CreateScheduledHabitRequest {
  scheduledHabit: ScheduledHabit;
}

export interface CreateScheduledHabitResponse extends Response {
  scheduledHabit?: ScheduledHabit;
}

export interface GetScheduledHabitResponse extends Response {
  scheduledHabit?: ScheduledHabit;
}

export interface UpdateScheduledHabitRequest {
  scheduledHabit: ScheduledHabit;
}
