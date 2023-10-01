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
  tasktPreferences?: TaskPreference[];
  quoteOfTheDay?: QuoteOfTheDay[];
  shallenges?: Challenge[];
  ChallengeParticipant?: ChallengeParticipant[];
  userAchievements?: UserAchievement[];
  tasks?: Task[];
  scheduledHabits?: ScheduledHabit[];
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
  iconUrl?: string;
  userId?: number;
  user?: User;
  habitCategoryId?: number;
  habitCategory?: HabitCategory;
  createdAt?: Date;
  updatedAt?: Date;
  taskPreference?: TaskPreference[];
  ChallengeRequirement?: ChallengeRequirement[];
  scheduledHabits?: ScheduledHabit[];
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
  challengeParticipant?: ChallengeParticipant[];
}

export interface PlannedTask {
  id?: number;
  plannedDayId?: number;
  plannedDay?: PlannedDay;
  scheduledHabitId?: number;
  scheduledHabit?: ScheduledHabit;
  title?: string;
  description?: string;
  iconUrl?: string;
  unitId?: number;
  unit?: Unit;
  quantity?: number;
  completedQuantity?: number;
  status?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskPreference {
  id?: number;
  userId?: number;
  user?: User;
  taskId?: number;
  task?: Task;
  unitId?: number;
  unit?: Unit;
  quantity?: number;
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
  title?: string;
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
  challenges?: Challenge[];
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
  challenges?: Challenge[];
}

export interface Image {
  id?: number;
  url?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  plannedDayResults?: PlannedDayResult[];
  userPosts?: UserPost[];
  challenges?: Challenge[];
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

export interface Challenge {
  id?: number;
  name?: string;
  description?: string;
  creator?: User;
  creatorId?: number;
  challengeRequirements?: ChallengeRequirement[];
  challengeRewards?: ChallengeReward[];
  start?: Date;
  end?: Date;
  active?: boolean;
  images?: Image[];
  likes?: Like[];
  comments?: Comment[];
  createdAt?: Date;
  updatedAt?: Date;
  challengeParticipants?: ChallengeParticipant[];
}

export interface ChallengeRequirement {
  id?: number;
  challenge?: Challenge;
  challengeId?: number;
  task?: Task;
  taskId?: number;
  unit?: Unit;
  unitId?: number;
  calculationType?: ChallengeCalculationType;
  calculationIntervalDays?: number;
  requiredIntervalQuantity?: number;
  requiredTaskQuantity?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChallengeReward {
  id?: number;
  name?: string;
  description?: string;
  imageUrl?: string;
  active?: boolean;
  challenge?: Challenge[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChallengeParticipant {
  id?: number;
  user?: User;
  userId?: number;
  challenge?: Challenge;
  challengeId?: number;
  amountComplete?: number;
  challengeRequirementCompletionState?: ChallengeRequirementCompletionState;
  completedOnPlannedDayId?: number;
  completedOnPlannedDay?: PlannedDay;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Achievement {
  id?: number;
  name?: string;
  imageUrl?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  userAchievements?: UserAchievement[];
}

export interface UserAchievement {
  id?: number;
  user?: User;
  userId?: number;
  achievement?: Achievement;
  achievementId?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Unit {
  id?: number;
  unit?: string;
  abreveation?: string;
  stepSize?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  PlannedTask?: PlannedTask[];
  challengeRequirement?: ChallengeRequirement[];
  taskPreference?: TaskPreference[];
  ScheduledHabit?: ScheduledHabit[];
}

export interface HabitCategory {
  id?: number;
  name?: string;
  description?: string;
  imageUrl?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  tasks?: Task[];
}

export interface DayOfWeek {
  id?: number;
  day?: string;
  createdAt?: Date;
  updatedAt?: Date;
  scheduledHabits?: ScheduledHabit[];
}

export interface TimeOfDay {
  id?: number;
  period?: string;
  createdAt?: Date;
  updatedAt?: Date;
  scheduledHabits?: ScheduledHabit[];
}

export interface ScheduledHabit {
  id?: number;
  userId?: number;
  user?: User;
  taskId?: number;
  task?: Task;
  description?: string;
  daysOfWeek?: DayOfWeek[];
  timesOfDay?: TimeOfDay[];
  quantity?: number;
  unitId?: number;
  unit?: Unit;
  endDate?: Date;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  plannedTasks?: PlannedTask[];
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
  PLANNING = 'PLANNING',
  ACTIVE_CHALLENGES = 'ACTIVE_CHALLENGES',
}

export enum ChallengeCalculationType {
  INVALID = 'INVALID',
  TOTAL = 'TOTAL',
  UNIQUE = 'UNIQUE',
}

export enum ChallengeRequirementCompletionState {
  INVALID = 'INVALID',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export interface ChallengeCompletionData {
  amountComplete: number;
  amountRequired: number;
  percentComplete: number;
  challengeRequirementCompletionState: ChallengeRequirementCompletionState;
}

export interface JoinedChallenge {
  challenge: Challenge;
  participants: ChallengeParticipant[];
}
