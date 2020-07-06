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

export const SELECT_AREA_OF_INTEREST = gql`
  subscription selectOneAreaOfInterest($id: uuid!) {
    areaOfInterest(id: $id) {
      id
      name
      source
      tilesCount
      tileSets {
        id
        progress
        size
        tileProvider {
          id
          slug
          url
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
      }
      tileProvider {
        id
        slug
        url
      }
    }
  }
`

export const INSERT_AREA_OF_INTEREST = gql`
  mutation insertAoi($name: String!, $source: jsonb!) {
    insertAreaOfInterestAction(name: $name, source: $source) {
      areaOfInterestId
      areaOfInterest {
        id
        name
        tilesCount
      }
    }
  }
`
