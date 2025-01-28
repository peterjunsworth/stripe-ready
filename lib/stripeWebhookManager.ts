import { stripe } from './stripe';

/**
 * Create a new Stripe webhook endpoint.
 */
export async function createStripeWebhook() {
    try {
        const webhook = await stripe.webhookEndpoints.create({
            url: `${process.env.STRIPE_WEBHOOK_PRODUCT_CREATED_URL}`, // Update with your webhook handler URL
            enabled_events: [
                'product.created',
                'product.updated',
                'product.deleted',
            ],
        });

        console.log('Webhook created successfully:', webhook);
        return webhook;
    } catch (error) {
        console.error('Error creating webhook:', error);
        throw error;
    }
}

/**
 * Update an existing Stripe webhook endpoint.
 * @param webhookId - The ID of the webhook to update
 */
export async function updateStripeWebhook(webhookId: string) {
    const url = process.env.STRIPE_WEBHOOK_PRODUCT_UPDATED_URL;
    if (!url) {
        throw new Error('STRIPE_WEBHOOK_PRODUCT_UPDATED_URL environment variable is not set');
    }
    
    return await stripe.webhookEndpoints.update(webhookId, {
        url,
        enabled_events: ['product.created', 'product.updated', 'product.deleted', 'price.created'],
    });
}

/**
 * Delete a Stripe webhook endpoint.
 * @param webhookId - The ID of the webhook to delete
 */
export async function deleteStripeWebhook(webhookId: string) {
    try {
        const deletedWebhook = await stripe.webhookEndpoints.del(webhookId);
        console.log('Webhook deleted successfully:', deletedWebhook);
        return deletedWebhook;
    } catch (error) {
        console.error('Error deleting webhook:', error);
        throw error;
    }
}

/**
 * List all Stripe webhook endpoints.
 */
export async function listStripeWebhooks() {
    try {
        const webhooks = await stripe.webhookEndpoints.list();
        console.log('Webhook endpoints:', webhooks.data);
        return webhooks.data;
    } catch (error) {
        console.error('Error listing webhooks:', error);
        throw error;
    }
}
