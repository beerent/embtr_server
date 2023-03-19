import { PlannedDayModel } from "./PlannedDayModel";

export interface PlannedDayResultModel {
  id?: number;
  plannedDay?: PlannedDayModel;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
