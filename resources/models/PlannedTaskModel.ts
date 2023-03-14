import { PlannedDayModel } from "./PlannedDayModel";
import { TaskModel } from "./TaskModel";

export interface PlannedTaskModel {
  id?: number;
  plannedDay?: PlannedDayModel;
  task?: TaskModel;
  status?: string;
  active?: boolean;
}
