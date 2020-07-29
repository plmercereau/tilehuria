import gql from 'graphql-tag'
import { ItemOptions } from 'src/composables'
import { TileProvider } from 'src/generated'

const PROVIDER_FRAGMENT = gql`
  fragment providerFragment on tile_provider {
    id
    name
    slug
    url
    tileSets_aggregate {
      aggregate {
        count
      }
    }
  }
`

export const PROVIDER_CONFIG: ItemOptions<TileProvider> = {
  subscription: gql`
    subscription selectOneProvider($id: uuid!) {
      tileProvider {
        ...providerFragment
      }
    }
    ${PROVIDER_FRAGMENT}
  `,

  insert: gql`
    mutation insertProvider($name: String!, $slug: String!, $url: String!) {
      insertTileProvider(object: { name: $name, slug: $slug, url: $url }) {
        ...providerFragment
      }
    }
    ${PROVIDER_FRAGMENT}
  `,

  list: gql`
    query listAllTileProviders {
      tileProviders(order_by: { name: asc }) {
        ...providerFragment
      }
    }
    ${PROVIDER_FRAGMENT}
  `,

  remove: gql`
    mutation removeOneTileProvider($id: uuid!) {
      deleteTileProvider(id: $id) {
        id
      }
    }
  `,

  defaults: {
    name: '',
    url: '',
    slug: ''
  },

  properties: ['name', 'url', 'slug'],

  sort: (a, b) =>
    a.name.toLowerCase() > b.name.toLowerCase()
      ? 1
      : a.name.toLowerCase() === b.name.toLowerCase()
      ? 0
      : -1
}
