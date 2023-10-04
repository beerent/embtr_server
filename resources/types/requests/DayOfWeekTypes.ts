import { DayOfWeek } from "../../schema";
import { Response } from "./RequestTypes";

export interface GetDaysOfWeekResponse extends Response {
  daysOfWeek?: DayOfWeek[]
}
