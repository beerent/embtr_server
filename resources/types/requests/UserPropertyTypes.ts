import { Response } from './RequestTypes';
import { Constants } from '../constants/constants';

export interface SetUserTimezoneRequest {
  timezone: string;
}

export interface SetUserTimezoneResponse extends Response {
  timezone?: string;
}

export interface GetUserTimezoneResponse extends Response {
  timezone?: string;
}

export interface SetUserSocialNotificationRequest {
  setting: Constants.SocialNotificationSetting;
}

export interface SetUserSocialNotificationResponse extends Response {
  setting?: Constants.SocialNotificationSetting;
}

export interface GetUserSocialNotificationResponse extends Response {
  setting?: Constants.SocialNotificationSetting;
}

export interface SetUserReminderNotificationRequest {
  setting: Constants.ReminderNotificationSetting;
}

export interface SetUserReminderNotificationResponse extends Response {
  setting?: Constants.ReminderNotificationSetting;
}

export interface GetUserReminderNotificationResponse extends Response {
  setting?: Constants.ReminderNotificationSetting;
}

export interface SetUserWarningNotificationRequest {
  setting: Constants.WarningNotificationSetting;
}

export interface SetUserWarningNotificationResponse extends Response {
  setting?: Constants.WarningNotificationSetting;
}

export interface GetUserWarningNotificationResponse extends Response {
  setting?: Constants.WarningNotificationSetting;
}
