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
  accountSetup?: boolean;
  termsVersion?: number;
  createdAt?: Date;
  updatedAt?: Date;
  user?: UserPost[];
  plannedDays?: PlannedDay[];
  receivedNotifications?: Notification[];
  sendNotifications?: Notification[];
  pushNotificationTokens?: PushNotificationToken[];
  comments?: Comment[];
  likes?: Like[];
  widgets?: Widget[];
  quoteOfTheDay?: QuoteOfTheDay[];
  challenges?: Challenge[];
  challengeParticipant?: ChallengeParticipant[];
  userAwards?: UserAward[];
  tasks?: Task[];
  scheduledHabits?: ScheduledHabit[];
  blockingUsers?: BlockedUser[];
  blockedUsers?: BlockedUser[];
  roles?: Role[];
  properties?: Property[];
}

export interface Property {
  id?: number;
  userId?: number;
  user?: User;
  key?: string;
  value?: string;
  createdAt?: Date;
  updatedAt?: Date;
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

export interface Task extends TaskCustom {
  id?: number;
  title?: string;
  description?: string;
  iconId?: number;
  icon?: Icon;
  userId?: number;
  user?: User;
  habitCategoryId?: number;
  habitCategory?: HabitCategory;
  type?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  challengeRequirements?: ChallengeRequirement[];
  scheduledHabits?: ScheduledHabit[];
}

export interface PlannedDay {
  id?: number;
  user?: User;
  userId?: number;
  dayKey?: string;
  date?: Date;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  plannedTasks?: PlannedTask[];
  plannedDayResults?: PlannedDayResult[];
  challengeParticipant?: ChallengeParticipant[];
  plannedDayChallengeMilestones?: PlannedDayChallengeMilestone[];
}

export interface PlannedTask extends PlannedTaskCustom {
  id?: number;
  plannedDayId?: number;
  plannedDay?: PlannedDay;
  scheduledHabitId?: number;
  scheduledHabit?: ScheduledHabit;
  timeOfDayId?: number;
  timeOfDay?: TimeOfDay;
  originalTimeOfDayId?: number;
  originalTimeOfDay?: TimeOfDay;
  title?: string;
  description?: string;
  iconId?: number;
  icon?: Icon;
  unitId?: number;
  unit?: Unit;
  quantity?: number;
  completedQuantity?: number;
  status?: string;
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

export interface Milestone {
  id?: number;
  key?: string;
  description?: string;
  localImage?: string;
  metric?: number;
  ordinal?: number;
  remoteImageUrl?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  challengeRequirements?: ChallengeRequirement[];
  challengeMilestones?: ChallengeMilestone[];
}

export interface ChallengeMilestone {
  id?: number;
  challengeId?: number;
  challenge?: Challenge;
  milestoneId?: number;
  milestone?: Milestone;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  plannedDayChallengeMilestones?: PlannedDayChallengeMilestone[];
}

export interface PlannedDayChallengeMilestone {
  id?: number;
  challengeMilestoneId?: number;
  challengeMilestone?: ChallengeMilestone;
  challengeParticipantId?: number;
  challengeParticipant?: ChallengeParticipant;
  plannedDayId?: number;
  plannedDay?: PlannedDay;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
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

export interface Season {
  id?: number;
  date?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Challenge extends ChallengeCustom {
  id?: number;
  name?: string;
  description?: string;
  creator?: User;
  creatorId?: number;
  challengeRequirements?: ChallengeRequirement[];
  awardId?: number;
  award?: Award;
  start?: Date;
  end?: Date;
  timelineTimestamp?: Date;
  active?: boolean;
  images?: Image[];
  likes?: Like[];
  comments?: Comment[];
  createdAt?: Date;
  updatedAt?: Date;
  challengeParticipants?: ChallengeParticipant[];
  challengeMilestones?: ChallengeMilestone[];
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
  milestones?: Milestone[];
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
  plannedDayChallengeMilestones?: PlannedDayChallengeMilestone[];
}

export interface Award {
  id?: number;
  name?: string;
  description?: string;
  iconId?: number;
  icon?: Icon;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  userAwards?: UserAward[];
  challenges?: Challenge[];
}

export interface UserAward {
  id?: number;
  user?: User;
  userId?: number;
  awardId?: number;
  award?: Award;
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
  ScheduledHabit?: ScheduledHabit[];
}

export interface HabitCategory {
  id?: number;
  name?: string;
  description?: string;
  remoteImageUrl?: string;
  localImage?: string;
  active?: boolean;
  order?: number;
  generic?: boolean;
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
  plannedTasks?: PlannedTask[];
  originalPlannedTasks?: PlannedTask[];
}

export interface ScheduledHabit extends ScheduledHabitCustom {
  id?: number;
  userId?: number;
  user?: User;
  taskId?: number;
  task?: Task;
  title?: string;
  description?: string;
  iconId?: number;
  icon?: Icon;
  daysOfWeekEnabled?: boolean;
  daysOfWeek?: DayOfWeek[];
  timesOfDayEnabled?: boolean;
  timesOfDay?: TimeOfDay[];
  detailsEnabled?: boolean;
  quantity?: number;
  unitId?: number;
  unit?: Unit;
  startDate?: Date;
  endDate?: Date;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  plannedTasks?: PlannedTask[];
}

export interface BlockedUser {
  id?: number;
  userId?: number;
  user?: User;
  blockedUserId?: number;
  blockedUser?: User;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Feature {
  id?: number;
  name?: string;
  requesterRoles?: Role[];
  targetRoles?: Role[];
}

export interface Role {
  id?: number;
  name?: string;
  users?: User[];
  requesterFeatures?: Feature[];
  targetFeatures?: Feature[];
}

export interface Icon {
  id?: number;
  name?: string;
  key?: string;
  remoteImageUrl?: string;
  localImage?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  tags?: Tag[];
  categories?: IconCategory[];
  plannedTasks?: PlannedTask[];
  ScheduledHabit?: ScheduledHabit[];
  Task?: Task[];
  Award?: Award[];
}

export interface Tag {
  id?: number;
  name?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  icons?: Icon[];
}

export interface IconCategory {
  id?: number;
  name?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  icons?: Icon[];
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

export interface ChallengeCustom {
    challengeRewards?: {
        id?: number;
        name?: string;
        description?: string;
        remoteImageUrl?: string;
        localImage?: string;
        active?: boolean;
        createdAt?: Date;
        updatedAt?: Date;
    }[];
}

export interface PlannedTaskCustom {
    remoteImageUrl?: string;
    localImage?: string;
}

export interface TaskCustom {
    remoteImageUrl?: string;
    localImage?: string;
}

export interface ScheduledHabitCustom {
    remoteImageUrl?: string;
    localImage?: string;
}
