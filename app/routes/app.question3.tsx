import {
	Card,
	Layout,
	List,
	Page,
	Text,
	BlockStack,
	Button,
} from '@shopify/polaris'
import { TitleBar, useAppBridge } from '@shopify/app-bridge-react'
import { authenticate } from 'app/shopify.server'
import type { ActionFunctionArgs } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { useEffect } from 'react'


export const action = async ({ request }: ActionFunctionArgs) => {
	if (request.method !== "POST") {
		return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 }).json()
	}

	try {
		const { admin } = await authenticate.admin(request)
		const response = await admin.graphql(
			`#graphql
				mutation WebhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
					webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
						webhookSubscription {
							id
							topic
							apiVersion {
								handle
							}
							format
							createdAt
						}
						userErrors {
							field
							message
						}
					}
				}`,
			{
				variables: {
					"topic": "ORDERS_CREATE",
					"webhookSubscription": {
						"callbackUrl": "https://admin.shopify.com/store/alumdtest/apps/webhooks",
						"format": "JSON"
					}
				},
			},
		)
		const data = await response.json()
		return {
			data
		}
	} catch (error) {
		console.error("Failed to create webhook:", error)
		return new Response(JSON.stringify({ success: false, error: (error as Error).message }), { status: 500 }).json()
	}
}


export default function Question3Page() {
	const fetcher = useFetcher<typeof action>()
	const shopify = useAppBridge()
	const isLoading =
		['loading', 'submitting'].includes(fetcher.state) &&
		fetcher.formMethod === 'POST'
	const subscribe = () => fetcher.submit({}, { method: 'POST' })
	const { response } = fetcher.data || {}
	console.log(response)

	useEffect(() => {
		if (response) {
			shopify.toast.show('Webhook created')
		}
	}, [response, shopify])

	return (
		<Page>
			<TitleBar title='Question 3' />
			<Layout>
				<Layout.Section variant='oneThird'>
					<Card>
						<BlockStack gap='200'>
							<Text as='h3' variant='headingMd'>
								Question 3: Shopify Webhook
							</Text>
							<List>
								<List.Item>
									<Text as='span' variant='bodyMd'>
										<b>Task</b>: Write a Node.js app in TypeScript to handle a Shopify webhook triggered when a
										product is updated. The function should:
										<ol>
											<li>Log the updated product details.</li>
											<li>Send an alert email if the price decreases by more than 20%.</li>
										</ol>
										<b>Use Default Data:</b>
										<ul>
											<li>Update a default product in your development store to test the webhook (e.g., reduce its price).</li>
										</ul>
										<b>GraphQL Requirements:</b>
										<ul>
											<li>Use the GraphQL Admin API to retrieve product details after receiving the webhook payload.</li>
											<li>Ensure the email alert contains:
												<ul>
													<li>Product title</li>
													<li>Old price</li>
													<li>New price</li>
													<li>Percentage decrease</li>
												</ul>
											</li>
										</ul>
									</Text>
								</List.Item>
							</List>
							<Button loading={isLoading} onClick={subscribe}>
								Subscribe to webhook
							</Button>
						</BlockStack>
					</Card>
				</Layout.Section>
			</Layout>
		</Page>
	)
}
