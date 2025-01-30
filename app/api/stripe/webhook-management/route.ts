import { NextRequest, NextResponse } from 'next/server';
import { createStripeWebhook, updateStripeWebhook, deleteStripeWebhook } from '@/lib/stripeWebhookManager';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]";

export async function POST(req: NextRequest) {
    try {

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        const webhook = await createStripeWebhook();
        return NextResponse.json({ success: true, webhook });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {

    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { webhookId } = await req.json();

    if (!webhookId) {
        return NextResponse.json({ error: 'Missing webhook ID' }, { status: 400 });
    }

    try {
        const updatedWebhook = await updateStripeWebhook(webhookId);
        return NextResponse.json({ success: true, updatedWebhook });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {

    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { webhookId } = await req.json();

    if (!webhookId) {
        return NextResponse.json({ error: 'Missing webhook ID' }, { status: 400 });
    }

    try {
        const deletedWebhook = await deleteStripeWebhook(webhookId);
        return NextResponse.json({ success: true, deletedWebhook });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
