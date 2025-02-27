import { authenticate } from 'app/shopify.server'

export async function subscribeToProductsUpdate(request: Request) {
	const { admin } = await authenticate.admin(request)

	const mutation = `
    mutation CreateProductsUpdateWebhook {
        webhookSubscriptionCreate(
            topic: PRODUCTS_UPDATE,
            webhookSubscription: {
                callbackUrl: "/webhooks/products/product_update",
                format: JSON
            }
        ) {
            webhookSubscription {
                id
                topic
                format
                endpoint {
                    __typename
                    ... on WebhookHttpEndpoint {
                        callbackUrl
                    }
                }
            }
            userErrors {
                field
                message
            }
        }
    }`

    return {}
	const response = await admin.graphql(mutation)
	return response.json()
}
