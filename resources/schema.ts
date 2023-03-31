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
  plannedDays?: PlannedDay[];
  recievedNotifications?: Notification[];
  sendNotifications?: Notification[];
  pushNotificationTokens?: PushNotificationToken[];
  comments?: Comment[];
  Like?: Like[];
}

export interface PushNotificationToken {
  id?: number;
  userId?: number;
  user?: User;
  token?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
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

export interface UserPost {
  id?: number;
  active?: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  comments?: Comment[];
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
  likes?: Like[];
  comments?: Comment[];
}

export interface Comment {
  id?: number;
  userId?: number;
  user?: User;
  comment?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  PlannedDayResultComment?: PlannedDayResult[];
  UserPost?: UserPost[];
}

export interface Like {
  id?: number;
  userId?: number;
  user?: User;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  PlannedDayResult?: PlannedDayResult[];
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

export interface Notification {
  id?: number;
  fromUserId?: number;
  fromUser?: User;
  toUserId?: number;
  toUser?: User;
  read?: boolean;
  summary?: string;
  targetPage?: NotificationTargetPage;
  targetId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum NotificationTargetPage {
  INVALID = 'INVALID',
  GOAL_DETAILS = 'GOAL_DETAILS',
  USER_PROFILE = 'USER_PROFILE',
  CHALLENGE_DETAILS = 'CHALLENGE_DETAILS',
  USER_POST_DETAILS = 'USER_POST_DETAILS',
  PLANNED_DAY_RESULT = 'PLANNED_DAY_RESULT',
  TODAY = 'TODAY',
}
