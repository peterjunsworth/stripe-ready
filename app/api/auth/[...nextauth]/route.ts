import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            authorize(credentials) {
                if (
                    credentials?.username === process.env.NEXTAUTH_USERNAME &&
                    credentials?.password === process.env.NEXTAUTH_PASSWORD
                ) {
                    return { id: '1', name: 'Authenticated User' };
                }
                return null;
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/auth/signin',
    },
};

export async function GET(req: NextApiRequest, res: NextApiResponse) {
    return NextAuth(req, res, authOptions);
}

export async function POST(req: NextApiRequest, res: NextApiResponse) {
    return NextAuth(req, res, authOptions);
}
