import { Notification as NotificationModel} from "../schema";
import { Response } from "./RequestTypes";

export interface GetNotificationsResponse extends Response {
  notifications?: NotificationModel[]
}

export interface ClearNotificationsRequest {
  notificationIds?: number[]
}
