import gql from 'graphql-tag'
export * from './area-of-interest'
export * from './provider'

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
