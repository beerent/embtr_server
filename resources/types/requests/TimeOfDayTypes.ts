import { TimeOfDay } from "../../schema";
import { Response } from "./RequestTypes";

export interface GetTimesOfDayResponse extends Response {
  timesOfDay?: TimeOfDay[]
}
