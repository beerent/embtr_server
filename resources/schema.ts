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
  accountSetup?: boolean;
  termsVersion?: number;
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
  habitStreaks?: HabitStreak[];
  userBadges?: UserBadge[];
  pointLedgerRecords?: PointLedgerRecord[];
}

export interface Property {
  id?: number;
  userId?: number;
  key?: string;
  value?: string;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
}

export interface PushNotificationToken {
  id?: number;
  userId?: number;
  token?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
}

export interface Task extends TaskCustom {
  id?: number;
  title?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  habitCategoryId?: number;
  userId?: number;
  active?: boolean;
  type?: string;
  iconId?: number;
  icon?: Icon;
  user?: User;
  habitCategory?: HabitCategory;
  challengeRequirements?: ChallengeRequirement[];
  scheduledHabits?: ScheduledHabit[];
  habitStreaks?: HabitStreak[];
}

export interface PlannedDay {
  id?: number;
  userId?: number;
  dayKey?: string;
  date?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  status?: string;
  user?: User;
  plannedTasks?: PlannedTask[];
  plannedDayResults?: PlannedDayResult[];
  challengeParticipant?: ChallengeParticipant[];
  plannedDayChallengeMilestones?: PlannedDayChallengeMilestone[];
}

export interface PlannedTask extends PlannedTaskCustom {
  id?: number;
  plannedDayId?: number;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  quantity?: number;
  completedQuantity?: number;
  active?: boolean;
  unitId?: number;
  description?: string;
  scheduledHabitId?: number;
  title?: string;
  timeOfDayId?: number;
  originalTimeOfDayId?: number;
  iconId?: number;
  plannedDay?: PlannedDay;
  scheduledHabit?: ScheduledHabit;
  timeOfDay?: TimeOfDay;
  originalTimeOfDay?: TimeOfDay;
  icon?: Icon;
  unit?: Unit;
}

export interface UserPost {
  id?: number;
  title?: string;
  body?: string;
  userId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  active?: boolean;
  user?: User;
  images?: Image[];
  likes?: Like[];
  comments?: Comment[];
}

export interface PlannedDayResult {
  id?: number;
  plannedDayId?: number;
  active?: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  title?: string;
  plannedDay?: PlannedDay;
  images?: Image[];
  likes?: Like[];
  comments?: Comment[];
}

export interface Milestone {
  id?: number;
  description?: string;
  localImage?: string;
  remoteImageUrl?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  key?: string;
  ordinal?: number;
  metric?: number;
  challengeRequirements?: ChallengeRequirement[];
  challengeMilestones?: ChallengeMilestone[];
}

export interface ChallengeMilestone {
  id?: number;
  challengeId?: number;
  milestoneId?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  challenge?: Challenge;
  milestone?: Milestone;
  plannedDayChallengeMilestones?: PlannedDayChallengeMilestone[];
}

export interface PlannedDayChallengeMilestone {
  id?: number;
  challengeMilestoneId?: number;
  plannedDayId?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  challengeParticipantId?: number;
  challengeMilestone?: ChallengeMilestone;
  challengeParticipant?: ChallengeParticipant;
  plannedDay?: PlannedDay;
}

export interface Comment {
  id?: number;
  userId?: number;
  comment?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
  plannedDayResults?: PlannedDayResult[];
  userPosts?: UserPost[];
  challenges?: Challenge[];
}

export interface Like {
  id?: number;
  userId?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
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
  toUserId?: number;
  read?: boolean;
  summary?: string;
  targetPage?: NotificationTargetPage;
  targetId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  fromUser?: User;
  toUser?: User;
}

export interface Widget {
  id?: number;
  type?: WidgetType;
  order?: number;
  userId?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
}

export interface QuoteOfTheDay {
  id?: number;
  quote?: string;
  author?: string;
  userId?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
  likes?: Like[];
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
  creatorId?: number;
  start?: Date;
  end?: Date;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  timelineTimestamp?: Date;
  awardId?: number;
  creator?: User;
  challengeRequirements?: ChallengeRequirement[];
  award?: Award;
  images?: Image[];
  likes?: Like[];
  comments?: Comment[];
  challengeParticipants?: ChallengeParticipant[];
  challengeMilestones?: ChallengeMilestone[];
}

export interface ChallengeRequirement {
  id?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  challengeId?: number;
  taskId?: number;
  unitId?: number;
  calculationIntervalDays?: number;
  calculationType?: ChallengeCalculationType;
  requiredIntervalQuantity?: number;
  requiredTaskQuantity?: number;
  challenge?: Challenge;
  task?: Task;
  unit?: Unit;
  milestones?: Milestone[];
}

export interface ChallengeParticipant {
  id?: number;
  userId?: number;
  challengeId?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  amountComplete?: number;
  challengeRequirementCompletionState?: ChallengeRequirementCompletionState;
  completedOnPlannedDayId?: number;
  user?: User;
  challenge?: Challenge;
  completedOnPlannedDay?: PlannedDay;
  plannedDayChallengeMilestones?: PlannedDayChallengeMilestone[];
}

export interface Award {
  id?: number;
  name?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  description?: string;
  iconId?: number;
  icon?: Icon;
  userAwards?: UserAward[];
  challenges?: Challenge[];
}

export interface UserAward {
  id?: number;
  userId?: number;
  awardId?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
  award?: Award;
}

export interface Unit {
  id?: number;
  unit?: string;
  stepSize?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  abreveation?: string;
  PlannedTask?: PlannedTask[];
  challengeRequirement?: ChallengeRequirement[];
  ScheduledHabit?: ScheduledHabit[];
}

export interface HabitCategory {
  id?: number;
  name?: string;
  description?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  order?: number;
  localImage?: string;
  remoteImageUrl?: string;
  generic?: boolean;
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
  taskId?: number;
  quantity?: number;
  unitId?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  description?: string;
  userId?: number;
  endDate?: Date;
  startDate?: Date;
  title?: string;
  daysOfWeekEnabled?: boolean;
  timesOfDayEnabled?: boolean;
  detailsEnabled?: boolean;
  iconId?: number;
  user?: User;
  task?: Task;
  icon?: Icon;
  daysOfWeek?: DayOfWeek[];
  timesOfDay?: TimeOfDay[];
  unit?: Unit;
  plannedTasks?: PlannedTask[];
}

export interface BlockedUser {
  id?: number;
  userId?: number;
  blockedUserId?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
  blockedUser?: User;
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
  badges?: Badge[];
  habitStreakTiers?: HabitStreakTier[];
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

export interface HabitStreak {
  id?: number;
  userId?: number;
  taskId?: number;
  type?: string;
  streak?: number;
  user?: User;
  task?: Task;
}

export interface Badge {
  id?: number;
  iconId?: number;
  category?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  key?: string;
  priority?: number;
  icon?: Icon;
  habitStreakTiers?: HabitStreakTier[];
  userBadges?: UserBadge[];
  levels?: Level[];
}

export interface UserBadge {
  id?: number;
  userId?: number;
  badgeId?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
  badge?: Badge;
}

export interface HabitStreakTier {
  id?: number;
  badgeId?: number;
  minStreak?: number;
  maxStreak?: number;
  backgroundColor?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  iconId?: number;
  name?: string;
  badge?: Badge;
  icon?: Icon;
}

export interface Level {
  id?: number;
  name?: string;
  minPoints?: number;
  maxPoints?: number;
  level?: number;
  badgeId?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  badge?: Badge;
}

export interface PointDefinition {
  id?: number;
  version?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  type?: string;
  points?: number;
}

export interface PointLedgerRecord {
  id?: number;
  userId?: number;
  relevantId?: number;
  pointDefinitionType?: string;
  points?: number;
  user?: User;
}

export interface ChallengeRequirementToMilestone {
  A?: number;
  B?: number;
}

export interface ChallengeToComment {
  A?: number;
  B?: number;
}

export interface ChallengeToImage {
  A?: number;
  B?: number;
}

export interface ChallengeToLike {
  A?: number;
  B?: number;
}

export interface CommentToPlannedDayResult {
  A?: number;
  B?: number;
}

export interface CommentToUserPost {
  A?: number;
  B?: number;
}

export interface DayOfWeekToScheduledHabit {
  A?: number;
  B?: number;
}

export interface FeatureToRequesterRole {
  A?: number;
  B?: number;
}

export interface FeatureToTargetRole {
  A?: number;
  B?: number;
}

export interface IconToIconCategory {
  A?: number;
  B?: number;
}

export interface IconToTag {
  A?: number;
  B?: number;
}

export interface ImageToPlannedDayResult {
  A?: number;
  B?: number;
}

export interface ImageToUserPost {
  A?: number;
  B?: number;
}

export interface LikeToPlannedDayResult {
  A?: number;
  B?: number;
}

export interface LikeToQuoteOfTheDay {
  A?: number;
  B?: number;
}

export interface LikeToUserPost {
  A?: number;
  B?: number;
}

export interface RoleToUser {
  A?: number;
  B?: number;
}

export interface ScheduledHabitToTimeOfDay {
  A?: number;
  B?: number;
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
