import gql from 'graphql-tag'

export const AREAS_OF_INTEREST = gql`
  query list {
    areasOfInterest(order_by: { name: asc }) {
      id
      name
      tilesCount
    }
  }
`

export const SELECT_AREA_OF_INTEREST = gql`
  query aoi($id: uuid!) {
    areaOfInterest(id: $id) {
      id
      name
      source
      tilesCount
      tileSets {
        id
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
  query aoi($id: uuid!) {
    tileSet(id: $id) {
      id
      quality
      format
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
        source
        tilesCount
      }
    }
  }
`
