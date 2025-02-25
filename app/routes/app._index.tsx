import {
  useEffect,
  // useCallback, useState
} from 'react'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  List,
  InlineStack,
  DataTable,
  // TextField,
} from '@shopify/polaris'
import { TitleBar, useAppBridge } from '@shopify/app-bridge-react'
import { authenticate } from '../shopify.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)

  return null
}

interface Orders {
  orders: {
    edges: Array<{
      node: Order
    }>
  }
}

interface Order {
  id: string
  updatedAt: string
  lineItems: {
    edges: Array<{
      node: LineItem
    }>
  }
  customer: {
    firstName: string
  }
}

interface LineItem {
  quantity: number
  variant: {
    product: {
      id: string
      title: string
    }
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request)
  const response = await admin.graphql(
    `#graphql
    {
      orders(first: 10, query: "updated_at:>2025-02-01") {
        edges {
          node {
            id
            updatedAt
            lineItems(first: 20) {
              edges {
                node {
                  quantity
                  variant {
                    product {
                      id
                      title
                    }
                  }
                }
              }
            }
            customer {
              firstName
            }
          }
        }
      }
    }`,
  )

  const responseJson = await response.json()

  const { orders } = responseJson.data! as Orders

  return { orders }
}

export default function Index() {
  const fetcher = useFetcher<typeof action>()

  const shopify = useAppBridge()
  const isLoading =
    ['loading', 'submitting'].includes(fetcher.state) &&
    fetcher.formMethod === 'POST'
  const { orders } = fetcher.data || {}

  useEffect(() => {
    if (orders) {
      shopify.toast.show('Orders retrieved')
    }
  }, [orders, shopify])
  const getOrders = () => fetcher.submit({}, { method: 'POST' })
  const rows = orders?.edges.map(({ node }) => [
    node.id.replace(
      'gid://shopify/Order/',
      '',
    ),
    new Date(node.updatedAt).toLocaleDateString('en-GB'),
    node.customer.firstName,
    node.lineItems.edges[0].node.variant.product.id.replace('gid://shopify/Product/', ''),
    node.lineItems.edges[0].node.variant.product.title,
    node.lineItems.edges[0].node.quantity,
  ]) || []

  // const [value, setValue] = useState('10050191753562')
  // const handleChange = useCallback(
  //   (newValue: string) => setValue(newValue),
  //   [],
  // )

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
                        each order: Order ID, Customer name, Product details (ID,
                        title, quantity).
                      </Text>
                    </List.Item>
                  </List>
                </BlockStack>
                <InlineStack>
                  <Button loading={isLoading} onClick={getOrders}>
                    Fetch orders
                  </Button>
                  {/* <TextField
                    label="Order Id"
                    value={value}
                    onChange={handleChange}
                    autoComplete="off"
                    type='number'
                  /> */}
                </InlineStack>
                {orders && (
                  <Card>
                    <DataTable
                      columnContentTypes={[
                        'numeric',
                        'text',
                        'text',
                        'text',
                        'text',
                        'text',
                      ]}
                      headings={[
                        'Order Id',
                        'Last Updated',
                        'Customer Name',
                        'Product ID',
                        'Product Title',
                        'Quantity',
                      ]}
                      rows={rows}
                    />
                  </Card>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  )
}
