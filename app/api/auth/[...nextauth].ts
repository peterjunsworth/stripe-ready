import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Credentials } from '@/types/interfaces';

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            authorize(credentials: Credentials | undefined) {
                if (credentials?.username === process.env.NEXTAUTH_USERNAME && credentials?.password === process.env.NEXTAUTH_PASSWORD) {
                    return { id: '1', name: 'Authenticated User' }; // Change id to a string
                }
                return null;
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
