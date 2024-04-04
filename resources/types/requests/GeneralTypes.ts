import { Response } from "./RequestTypes";
import { Comment, Like } from "../../schema";

export interface CreateCommentRequest {
  comment: string
}

export interface CreateCommentResponse extends Response {
  comment?: Comment
}

export interface DeleteCommentRequest {
  commentId: number;
}

export interface GetBooleanResponse extends Response {
  result?: boolean;
}

export interface CreateLikeResponse extends Response {
  like?: Like
}
