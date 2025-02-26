import {
	Card,
	Layout,
	List,
	Page,
	Text,
	BlockStack,
} from '@shopify/polaris'
import { TitleBar } from '@shopify/app-bridge-react'

export default function Question3Page() {
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
						</BlockStack>
					</Card>
				</Layout.Section>
			</Layout>
		</Page>
	)
}
