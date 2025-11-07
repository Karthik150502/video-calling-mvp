
export const IS_DEV_ENV = process.env.NODE_ENV === "development"

export const BASE_URL = IS_DEV_ENV ? process.env.NEXT_PUBLIC_BASE_URL : process.env.NEXT_PUBLIC_BASE_URL_PROD;

export const SIGNALING_SERVER = IS_DEV_ENV ? process.env.NEXT_PUBLIC_SIGNALING_SERVER : process.env.NEXT_PUBLIC_SIGNALING_SERVER_PROD;

export const AUTH_CALLBACK = `${BASE_URL}/${process.env.NEXT_PUBLIC_AUTH_CALLBACK_URL}`


