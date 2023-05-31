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
  user?: UserPost[];
  plannedDays?: PlannedDay[];
  recievedNotifications?: Notification[];
  sendNotifications?: Notification[];
  pushNotificationTokens?: PushNotificationToken[];
  comments?: Comment[];
  likes?: Like[];
  widgets?: Widget[];
  taskHabitPreference?: TaskHabitPreference[];
  quoteOfTheDay?: QuoteOfTheDay[];
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
  taskHabitPreference?: TaskHabitPreference[];
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
  plannedDayResults?: PlannedDayResult[];
  hiddenPlannedDayResultRecommendations?: HiddenPlannedDayResultRecommendations[];
}

export interface PlannedTask {
  id?: number;
  plannedDayId?: number;
  plannedDay?: PlannedDay;
  taskId?: number;
  task?: Task;
  habitId?: number;
  habit?: Habit;
  count?: number;
  completedCount?: number;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Habit {
  id?: number;
  title?: string;
  description?: string;
  iconSource?: string;
  iconName?: string;
  createdAt?: Date;
  updatedAt?: Date;
  plannedTasks?: PlannedTask[];
  taskHabitPreference?: TaskHabitPreference[];
}

export interface TaskHabitPreference {
  id?: number;
  userId?: number;
  user?: User;
  taskId?: number;
  task?: Task;
  habitId?: number;
  habit?: Habit;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserPost {
  id?: number;
  title?: string;
  body?: string;
  userId?: number;
  user?: User;
  createdAt?: Date;
  updatedAt?: Date;
  active?: boolean;
  images?: Image[];
  likes?: Like[];
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
  images?: Image[];
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
  plannedDayResults?: PlannedDayResult[];
  userPosts?: UserPost[];
}

export interface Like {
  id?: number;
  userId?: number;
  user?: User;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  plannedDayResults?: PlannedDayResult[];
  userPosts?: UserPost[];
  quoteOfTheDays?: QuoteOfTheDay[];
}

export interface Image {
  id?: number;
  url?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  plannedDayResults?: PlannedDayResult[];
  userPosts?: UserPost[];
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

export interface Widget {
  id?: number;
  type?: WidgetType;
  order?: number;
  user?: User;
  userId?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuoteOfTheDay {
  id?: number;
  quote?: string;
  author?: string;
  userId?: number;
  user?: User;
  active?: boolean;
  likes?: Like[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Metadata {
  id?: number;
  key?: string;
  value?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface HiddenPlannedDayResultRecommendations {
  id?: number;
  plannedDayId?: number;
  plannedDay?: PlannedDay;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Season {
  id?: number;
  date?: Date;
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

export enum WidgetType {
  TIME_LEFT_IN_DAY = 'TIME_LEFT_IN_DAY',
  QUOTE_OF_THE_DAY = 'QUOTE_OF_THE_DAY',
  TODAYS_TASKS = 'TODAYS_TASKS',
  TODAYS_NOTES = 'TODAYS_NOTES',
  TODAYS_PHOTOS = 'TODAYS_PHOTOS',
  DAILY_HISTORY = 'DAILY_HISTORY',
  HABIT_JOURNEY = 'HABIT_JOURNEY',
}
