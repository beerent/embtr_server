import { PlannedDayModel } from "./PlannedDayModel";

export interface PlannedDayResultModel {
  id?: number;
  plannedDay?: PlannedDayModel;
  createdAt?: Date;
  updatedAt?: Date;
}
