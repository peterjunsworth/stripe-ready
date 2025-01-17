import { SessionOptions } from "iron-session";
import { SessionData } from "@/types/interfaces";

export const defaultSession: SessionData = {
    lineItems: [],
};

export const sessionOptions: SessionOptions = {
    password: process.env.SESSION_PASSWORD!,
    cookieName: "shopping-cart",
    cookieOptions: {
        secure: process.env.NODE_ENV === "production"
    },
};