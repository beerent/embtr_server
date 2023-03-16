export const ACCOUNT = "/account/";
export const ACCOUNT_SEND_EMAIL_VERIFICATION_ENDPOINT = `${ACCOUNT}send_verification_email/`;

export const USER = "/user/";
export const TASK = "/task/";
export const PLANNED_DAY = "/planned-day/";
export const PLANNED_TASK = "/planned-task/";
export const DAY_RESULT = "/day-result/";

export const getLocalizedEndpoint = (url: string) => {
  return url.substring(url.indexOf("/"));
}
