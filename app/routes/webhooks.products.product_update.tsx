import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { authenticate } from '../shopify.server'

export async function action({ request }: ActionFunctionArgs) {
	const { topic, shop } = await authenticate.webhook(request)
	console.log(`Received ${topic} webhook for ${shop}`)

	const data = await request.json()
	const title = data.title
	const variants = data.variants
	return new Response(JSON.stringify({ title: title, variants: variants }), {
		status: 200,
		headers: {
			"Content-Type": "application/json"
		}
	})
}

export async function loader({ request }: LoaderFunctionArgs) {
	return new Response('Hello', { status: 200 })
}
