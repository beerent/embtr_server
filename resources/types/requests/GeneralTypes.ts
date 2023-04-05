import { Response } from "./RequestTypes";

export interface CreateCommentRequest {
  comment: string
}

export interface CreateCommentResponse extends Response {
}

export interface DeleteCommentRequest {
  commentId: number;
}
