export interface User {
  id?: number;
  uid?: string;
  email?: string;
  username?: string;
  displayName?: string;
  location?: string;
  bio?: string;
  photoUrl?: string;
  bannerUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  PlannedDay?: PlannedDay[];
  PlannedDayResultComment?: PlannedDayResultComment[];
}

export interface Task {
  id?: number;
  title?: string;
  description?: string;
  createdById?: number;
  createdAt?: Date;
  updatedAt?: Date;
  plannedTasks?: PlannedTask[];
}

export interface PlannedDay {
  id?: number;
  user?: User;
  userId?: number;
  dayKey?: string;
  date?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  plannedTasks?: PlannedTask[];
  plannedDayResult?: PlannedDayResult[];
}

export interface PlannedTask {
  id?: number;
  plannedDayId?: number;
  plannedDay?: PlannedDay;
  taskId?: number;
  task?: Task;
  status?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlannedDayResult {
  id?: number;
  plannedDayId?: number;
  plannedDay?: PlannedDay;
  active?: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  plannedDayResultImages?: PlannedDayResultImage[];
  PlannedDayResultComments?: PlannedDayResultComment[];
}

export interface PlannedDayResultComment {
  id?: number;
  plannedDayResultId?: number;
  plannedDayResult?: PlannedDayResult;
  userId?: number;
  user?: User;
  comment?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlannedDayResultImage {
  id?: number;
  plannedDayResultId?: number;
  plannedDayResult?: PlannedDayResult;
  url?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
