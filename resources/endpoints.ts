export const ACCOUNT = "/account/";
export const ACCOUNT_SEND_EMAIL_VERIFICATION_ENDPOINT = `${ACCOUNT}send_verification_email/`;

export const USER = "/user/";

export const getLocalizedEndpoint = (url: string) => {
  return url.substring(url.indexOf("/"));
};
