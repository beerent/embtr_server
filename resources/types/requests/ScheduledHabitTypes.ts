import { Response } from "./RequestTypes";
import { ScheduledHabit } from "../../schema";

export interface CreateScheduledHabitRequest {
  taskId: number;
  description?: string;
  daysOfWeekIds?: number[];
  timesOfDayIds?: number[]
  quantity?: number;
  unitId?: number;
}

export interface CreateScheduledHabitResponse extends Response {
  scheduledHabit?: ScheduledHabit;
}
