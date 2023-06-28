import { Challenge} from "../../schema";
import { Response } from "./RequestTypes";

export interface GetChallengesResponse extends Response {
  challenges?: Challenge[],
}

export interface GetChallengeResponse extends Response {
  challenge?: Challenge,
}

export interface RegisterChallengeRequest {
  challengeId: number,
}
