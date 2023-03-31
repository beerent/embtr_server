import { UserPost} from "../schema";
import { Response } from "./RequestTypes";

export interface GetUserPostResponse extends Response {
  UserPost?: UserPost;
}
