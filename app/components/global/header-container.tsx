'use client';

import { SessionProvider } from "next-auth/react";
import Header from './header';

export default function HeaderContainer({ session }: any) {

    return (
        <SessionProvider session={session}>
            <Header />
        </SessionProvider>
    );
}
