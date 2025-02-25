import { useEffect } from 'react'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  InlineStack,
} from '@shopify/polaris'
import { TitleBar, useAppBridge } from '@shopify/app-bridge-react'
import { authenticate } from '../shopify.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)

  return null
}

interface Orders {
  orders: {
    edges: {
      node: {
        id: string
        updatedAt: string
      }
    }[]
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request)
  const response = await admin.graphql(
    `#graphql
  query {
    orders(first: 10, query: "updated_at:>2025-02-01") {
      edges {
        node {
          id
          updatedAt
        }
      }
    }
  }`,
  )

  const responseJson = await response.json()

  const orders = responseJson.data!.orders! as Orders

  return {
    orders
  }
}


export default function Index() {
  const fetcher = useFetcher<typeof action>()

  const shopify = useAppBridge()
  const isLoading =
    ['loading', 'submitting'].includes(fetcher.state) &&
    fetcher.formMethod === 'POST'
  const { orders } = fetcher.data?.orders || {}

  useEffect(() => {
    if (orders) {
      shopify.toast.show('Orders retrieved')
    }
  }, [orders, shopify])
  const getOrders = () => fetcher.submit({}, { method: 'POST' })

  return (
    <Page>
      <TitleBar title="Welcome to Marco's Demo Remix app 🤵🏻🥂" />
      <BlockStack gap='500'>
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap='500'>
                <BlockStack gap='200'>
                  <Text as='h3' variant='headingMd'>
                    Question 2: Shopify Admin API (GraphQL)
                  </Text>
                  <List>
                    <List.Item>
                      <Text as='span' variant='bodyMd'>
                        <b>Task</b>: Using Shopify's GraphQL Admin API, write a
                        Node.js script in TypeScript to retrieve all orders
                        placed within the last 30 days that contain a specific
                        product ID.
                      </Text>
                    </List.Item>
                    <List.Item>
                      <Text as='span' variant='bodyMd'>
                        <b>Use Default Data</b>: Choose one of the default
                        product IDs from your development store to filter
                        orders.
                      </Text>
                    </List.Item>
                    <List.Item>
                      <Text as='span' variant='bodyMd'>
                        <b>GraphQL Requirements</b>: Use GraphQL queries to
                        fetch orders. Include at least the following data for
                        each order: Order ID Customer name Product details (ID,
                        title, quantity).
                      </Text>
                    </List.Item>
                  </List>
                </BlockStack>
                <InlineStack gap='300'>
                  <Button loading={isLoading} onClick={getOrders}>
                    Fetch orders
                  </Button>
                  {fetcher.data?.orders && (
                    orders?.edges.map(({ node }) => (
                      <Box key={node.id}>
                        <Text as='span'>{node.id}</Text>
                        <Text as='span'>{node.updatedAt}</Text>
                      </Box>
                    ))
                  )}
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  )
}
