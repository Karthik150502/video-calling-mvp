
export const IS_DEV_ENV = process.env.NODE_ENV === "development"
export const SIGNALING_SERVER = IS_DEV_ENV ? process.env.NEXT_PUBLIC_SIGNALING_SERVER : process.env.NEXT_PUBLIC_SIGNALING_SERVER_PROD;

export const AUTH_CALLBACK = IS_DEV_ENV ? process.env.NEXT_PUBLIC_AUTH_CALLBACK : process.env.NEXT_PUBLIC_AUTH_CALLBACK_PROD;

