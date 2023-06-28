import {
  Like,
  User,
  Image,
  Task,
  Habit,
  Unit,
  ChallengeCalculationType,
  Challenge,
} from "../../schema";

export interface ChallengeDto {
  challenge: Challenge;
  custom: {};
}

export interface ChallengeRequirementDto {
  id?: number;
  challenge?: ChallengeDto;
  challengeId?: number;
  task?: Task;
  taskId?: number;
  habit?: Habit;
  habitId?: number;
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

export interface ChallengeRewardDto {
  id?: number;
  name?: string;
  description?: string;
  imageUrl?: string;
  active?: boolean;
  challenge?: ChallengeDto[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChallengeParticipantDto {
  id?: number;
  user?: User;
  userId?: number;
  challenge?: ChallengeDto;
  challengeId?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
