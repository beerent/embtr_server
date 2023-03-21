import { PlannedDayModel } from "./PlannedDayModel";
import { PlannedDayResultImageModel } from "./PlannedDayResultImageModel";

export interface PlannedDayResultModel {
  id?: number;
  plannedDay?: PlannedDayModel;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  plannedDayResultImages?: PlannedDayResultImageModel[];
}
