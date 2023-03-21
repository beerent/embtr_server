import { PlannedDayResultModel } from "./PlannedDayResultModel";

export interface PlannedDayResultImageModel {
  id?: number;
  plannedDayResult?: PlannedDayResultModel;
  url?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
