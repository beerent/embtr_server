import { UserModel } from "./UserModel";
import { PlannedTaskModel } from "./PlannedTaskModel";

export interface PlannedDayModel {
  id?: number;
  user?: UserModel;
  dayKey?: string;
  date?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  plannedTasks?: PlannedTaskModel[];
}
