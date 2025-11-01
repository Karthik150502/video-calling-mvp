
export type ActionResponse<T> = {
    data?: T | null;
    errorCode?: UIError;
    successMsg?: string
} | null;

export enum UIError {
    LOGIN_INVALID_CREDENTIALS = "B_LOGIN_INVALID_CREDENTIALS",
    CRED_LOGIN_ERROR = "B_CRED_LOGIN_ERROR",
    CRED_UPDATE_PWD_ERROR = "B_UPDATE_PWD_ERROR",
    CRED_SIGNUP_ERROR = "B_CRED_SIGNUP_ERROR",
    CRED_PWD_UPDATE_ERROR = "B_CRED_PWD_UPDATE_ERROR",
    CRED_RESET_PWD_ERROR = "B_CRED_RESET_PWD_ERROR",
    GOOGLE_SIGNUP_ERROR = "B_GOOGLE_SIGNUP_ERROR"
}

export const ErrorMessages: Record<UIError, string> = {
    [UIError.LOGIN_INVALID_CREDENTIALS]: "Invalid credentials.",
    [UIError.CRED_LOGIN_ERROR]: "Unable to login, try again later.",
    [UIError.CRED_UPDATE_PWD_ERROR]: "Unable to update password, try again later.",
    [UIError.CRED_SIGNUP_ERROR]: "Couldn't sign up due to some technical errors, please try again later.",
    [UIError.CRED_PWD_UPDATE_ERROR]: "Couldn't update password due to some technical errors, please try again later.",
    [UIError.CRED_RESET_PWD_ERROR]: "Couldn't send link due to some technical errors, please try again later.",
    [UIError.GOOGLE_SIGNUP_ERROR]: "Couldn't sign in with google due to some technical errors, please try again later.",
};
