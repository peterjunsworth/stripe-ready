'use client';

import { useState } from "react";
import { CircularProgress, Button, Input } from "@nextui-org/react";
import { signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';

export default function SignInPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const username = (e.target as any).username.value;
        const password = (e.target as any).password.value;

        const response = await signIn("credentials", { redirect: false, username, password });

        setLoading(false);
        if (response?.ok) {
            router.push("/admin/products");
        }
        if (response?.error) {
            setError("Invalid credentials. Please try again.");
        }
    };

    return (
        <div className="p-4">
            <div className="max-w-md mx-auto">
                <h2 className="mb-4">Sign In</h2>
                <form onSubmit={handleSignIn}>
                    <Input className="mb-4" label="Username" name="username" required />
                    <Input className="mb-4" label="Password" name="password" type="password" required />
                    <Button type="submit" color="primary" fullWidth disabled={loading}>
                        {loading ? <CircularProgress aria-label="Loading..." size="sm" /> : "Sign In"}
                    </Button>
                    {error && <h3 color="error">{error}</h3>}
                </form>
            </div>
        </div>
    );
}
