import {
	Card,
	Layout,
	List,
	Page,
	Text,
	BlockStack,
} from '@shopify/polaris'
import { TitleBar, useAppBridge } from '@shopify/app-bridge-react'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { useEffect } from 'react'
import { GraphqlQueryError } from '@shopify/shopify-api'
// import { subscribeToProductsUpdate } from 'app/utils/webhooks'
import { authenticate } from 'app/shopify.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
	await authenticate.admin(request)

	try {
		// originally planned to subscirbe to the hook via graphl from utils function
		// const { data } = await subscribeToProductsUpdate(request)
		return new Response()
	} catch (error) {
		if (error instanceof GraphqlQueryError) {
			throw new Error(
				`${error.message}\n${JSON.stringify(error.response, null, 2)}`
			)
		} else {
			throw error
		}
	}
}

export const action = async ({ request }: ActionFunctionArgs) => {
	const { topic, payload, admin } = await authenticate.webhook(request)
	if (!admin) {
		return new Response('Unauthorized', { status: 401 })
	}
	console.log(`Received ${topic}`)
	switch (topic) {
		case 'PRODUCTS_UPDATE':
			console.log(payload)
			const { variants } = payload as {
				variants: Array<{
					id: number
					price: string
					product_id: number
					title: string
					updated_at: string,
					admin_graphql_api_id: string,
				}>
			}

			// variant with the most recent update ... gids recently updated variants appearing first.
			const updatedVariant = variants[0]
			console.log(`Product Title: ${updatedVariant.title}`)
			console.log(`Variant Id: ${updatedVariant.id}`)
			console.log(`Variant gid: ${updatedVariant.admin_graphql_api_id}`)
			console.log(`Variant updated price: ${updatedVariant.price}`)

			const data = await admin.graphql(
				`#graphql
				query {
					product(id: "${updatedVariant.admin_graphql_api_id}") {
						id
						title
						descriptionHtml
						updatedAt
						variants(first: 10) {
							edges {
								node {
									id
									title
									price
								}
							}
						}
					}
				}`,
			)

			// send email
			console.log(JSON.stringify(data))

			return new Response()

		default:
			break
	}

	return new Response()
}


export default function Question3Page() {
	const fetcher = useFetcher<typeof action>()
	const shopify = useAppBridge()
	const { response } = fetcher.data || {}

	const data = useLoaderData()
	useEffect(() => {
		if (data) {
			shopify.toast.show('Webhook created')
			console.log(data)
		}
	}, [data, shopify])

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
										<b>Task</b>: Write a Node.js app in TypeScript to handle a Shopify webhook triggered when a product is updated. The function should:
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
						</BlockStack>
					</Card>
				</Layout.Section>
			</Layout>
		</Page>
	)
}
