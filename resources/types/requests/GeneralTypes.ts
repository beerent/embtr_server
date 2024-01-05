import { Response } from "./RequestTypes";
import { Comment } from "../../schema";

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
