import { PlannedDayModel } from "./PlannedDayModel";

export interface DayResultModel {
  id?: number;
  plannedDay?: PlannedDayModel;
  createdAt?: Date;
  updatedAt?: Date;
}
