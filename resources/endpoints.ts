export const USER_SEND_EMAIL_VERIFICATION_ENDPOINT = "/user/send_verification_email/"

export const getLocalizedEndpoint = (url: string) => {
    return url.substring(url.indexOf("/"));
}
