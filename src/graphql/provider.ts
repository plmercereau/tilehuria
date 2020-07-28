import gql from 'graphql-tag'
import { SingleItemOptions } from 'src/compositions'
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

export const PROVIDER_CONFIG: SingleItemOptions<TileProvider> = {
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
      tileProviders {
        ...providerFragment
      }
    }
    ${PROVIDER_FRAGMENT}
  `,

  defaults: {
    name: '',
    url: '',
    slug: ''
  } as TileProvider, // TODO infer as Partial<TileProvider>

  sort: (a, b) =>
    a.name.toLowerCase() > b.name.toLowerCase()
      ? 1
      : a.name.toLowerCase() === b.name.toLowerCase()
      ? 0
      : -1
}
