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
  Link,
  InlineStack,
} from '@shopify/polaris'
import { TitleBar, useAppBridge } from '@shopify/app-bridge-react'
import { authenticate } from '../shopify.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)

  return null
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request)
  const color = ['Red', 'Orange', 'Yellow', 'Green'][
    Math.floor(Math.random() * 4)
  ]
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  )
  const responseJson = await response.json()

  const product = responseJson.data!.productCreate!.product!
  const variantId = product.variants.edges[0]!.node!.id!

  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: '100.00' }],
      },
    },
  )

  const variantResponseJson = await variantResponse.json()

  return {
    product: responseJson!.data!.productCreate!.product,
    variant:
      variantResponseJson!.data!.productVariantsBulkUpdate!.productVariants,
  }
}

export default function Index() {
  const fetcher = useFetcher<typeof action>()

  const shopify = useAppBridge()
  const isLoading =
    ['loading', 'submitting'].includes(fetcher.state) &&
    fetcher.formMethod === 'POST'
  const productId = fetcher.data?.product?.id.replace(
    'gid://shopify/Product/',
    '',
  )

  useEffect(() => {
    if (productId) {
      shopify.toast.show('Product created')
    }
  }, [productId, shopify])
  const generateProduct = () => fetcher.submit({}, { method: 'POST' })

  return (
    <Page>
      <TitleBar title='Remix app template'>
        <button variant='primary' onClick={generateProduct}>
          Generate a product
        </button>
      </TitleBar>
      <BlockStack gap='500'>
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap='500'>
                <BlockStack gap='200'>
                  <Text as='h2' variant='headingMd'>
                    Welcome to Marco's app 🤵🏻🥂
                  </Text>
                </BlockStack>
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
                  <Button loading={isLoading} onClick={generateProduct}>
                    Generate a product
                  </Button>
                  {fetcher.data?.product && (
                    <Button
                      url={`shopify:admin/products/${productId}`}
                      target='_blank'
                      variant='plain'
                    >
                      View product
                    </Button>
                  )}
                </InlineStack>
                {fetcher.data?.product && (
                  <>
                    <Text as='h3' variant='headingMd'>
                      {' '}
                      productCreate mutation
                    </Text>
                    <Box
                      padding='400'
                      background='bg-surface-active'
                      borderWidth='025'
                      borderRadius='200'
                      borderColor='border'
                      overflowX='scroll'
                    >
                      <pre style={{ margin: 0 }}>
                        <code>
                          {JSON.stringify(fetcher.data.product, null, 2)}
                        </code>
                      </pre>
                    </Box>
                    <Text as='h3' variant='headingMd'>
                      {' '}
                      productVariantsBulkUpdate mutation
                    </Text>
                    <Box
                      padding='400'
                      background='bg-surface-active'
                      borderWidth='025'
                      borderRadius='200'
                      borderColor='border'
                      overflowX='scroll'
                    >
                      <pre style={{ margin: 0 }}>
                        <code>
                          {JSON.stringify(fetcher.data.variant, null, 2)}
                        </code>
                      </pre>
                    </Box>
                  </>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section variant='oneThird'>
            <BlockStack gap='500'>
              <Card>
                <BlockStack gap='200'>
                  <Text as='h2' variant='headingMd'>
                    App template specs
                  </Text>
                  <BlockStack gap='200'>
                    <InlineStack align='space-between'>
                      <Text as='span' variant='bodyMd'>
                        Framework
                      </Text>
                      <Link
                        url='https://remix.run'
                        target='_blank'
                        removeUnderline
                      >
                        Remix
                      </Link>
                    </InlineStack>
                    <InlineStack align='space-between'>
                      <Text as='span' variant='bodyMd'>
                        Database
                      </Text>
                      <Link
                        url='https://www.prisma.io/'
                        target='_blank'
                        removeUnderline
                      >
                        Prisma
                      </Link>
                    </InlineStack>
                    <InlineStack align='space-between'>
                      <Text as='span' variant='bodyMd'>
                        Interface
                      </Text>
                      <span>
                        <Link
                          url='https://polaris.shopify.com'
                          target='_blank'
                          removeUnderline
                        >
                          Polaris
                        </Link>
                        {', '}
                        <Link
                          url='https://shopify.dev/docs/apps/tools/app-bridge'
                          target='_blank'
                          removeUnderline
                        >
                          App Bridge
                        </Link>
                      </span>
                    </InlineStack>
                    <InlineStack align='space-between'>
                      <Text as='span' variant='bodyMd'>
                        API
                      </Text>
                      <Link
                        url='https://shopify.dev/docs/api/admin-graphql'
                        target='_blank'
                        removeUnderline
                      >
                        GraphQL API
                      </Link>
                    </InlineStack>
                  </BlockStack>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap='200'>
                  <Text as='h2' variant='headingMd'>
                    Next steps
                  </Text>
                  <List>
                    <List.Item>
                      Build an{' '}
                      <Link
                        url='https://shopify.dev/docs/apps/getting-started/build-app-example'
                        target='_blank'
                        removeUnderline
                      >
                        {' '}
                        example app
                      </Link>{' '}
                      to get started
                    </List.Item>
                    <List.Item>
                      Explore Shopify’s API with{' '}
                      <Link
                        url='https://shopify.dev/docs/apps/tools/graphiql-admin-api'
                        target='_blank'
                        removeUnderline
                      >
                        GraphiQL
                      </Link>
                    </List.Item>
                  </List>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  )
}
