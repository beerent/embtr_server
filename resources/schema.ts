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
  dayKey?: string;
  date?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  plannedTasks?: PlannedTask[];
  plannedDayResult?: PlannedDayResult[];
}

export interface PlannedTask {
  id?: number;
  plannedDay?: PlannedDay;
  task?: Task;
  status?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlannedDayResult {
  id?: number;
  plannedDay?: PlannedDay;
  active?: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  plannedDayResultImages?: PlannedDayResultImage[];
}

export interface PlannedDayResultImage {
  id?: number;
  plannedDayResult?: PlannedDayResult;
  url?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
