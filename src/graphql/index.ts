import gql from 'graphql-tag'

export const AREAS_OF_INTEREST = gql`
  query listAllAreasOfInterest {
    areasOfInterest(order_by: { name: asc }) {
      id
      name
      tilesCount
    }
  }
`

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

export const PROVIDERS = gql`
  query listAllTileProviders {
    tileProviders {
      ...providerFragment
    }
  }
  ${PROVIDER_FRAGMENT}
`

export const INSERT_PROVIDER = gql`
  mutation insertProvider($name: String!, $slug: String!, $url: String!) {
    insertTileProvider(object: { name: $name, slug: $slug, url: $url }) {
      ...providerFragment
    }
  }
  ${PROVIDER_FRAGMENT}
`

export const SELECT_AREA_OF_INTEREST = gql`
  subscription selectOneAreaOfInterest($id: uuid!) {
    areaOfInterest(id: $id) {
      id
      name
      source
      minZoom
      maxZoom
      tilesCount
      tileSets {
        id
        progress
        size
        format
        quality
        tileProvider {
          id
          name
          slug
          url
        }
        areaOfInterest {
          name
          userId
        }
      }
    }
  }
`

export const SELECT_TILE_SET = gql`
  query selectOneTileSet($id: uuid!) {
    tileSet(id: $id) {
      id
      quality
      format
      progress
      size
      areaOfInterest {
        name
        userId
      }
      tileProvider {
        id
        name
        slug
        url
      }
    }
  }
`

export const INSERT_AREA_OF_INTEREST = gql`
  mutation insertAoi($name: String!, $source: jsonb!) {
    insertAreaOfInterest(object: { name: $name, source: $source }) {
      id
      name
      tilesCount
    }
  }
`
