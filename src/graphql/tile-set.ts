import gql from 'graphql-tag'
import { ItemOptions } from 'src/composables'
import { TileSet } from 'src/generated'

export const TILE_SET_FRAGMENT = gql`
  fragment tileSetFragment on tile_set {
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
`

export const NESTED_TILE_SET_CONFIG: ItemOptions<
  TileSet,
  'format' | 'quality' | 'area_of_interest_id' // TODO underscores
> = {
  insert: gql`
    mutation insertOneTileSet(
      $format: String!
      $quality: Int!
      $areaOfInterestId: uuid!
    ) {
      insertAreaOfInterest(
        object: {
          format: $format
          quality: $quality
          areaOfInterestId: $areaOfInterestId
        }
      ) {
        # ? Optional, as optimisticResponse and subscribeToMore update the cache already
        ...tileSetFragment
      }
    }
    ${TILE_SET_FRAGMENT}
  `,

  update: gql`
    mutation updateOneTileSet($id: uuid!, $format: String!, $quality: Int!) {
      updateTileSet(
        pk_columns: { id: $id }
        _set: { format: $format, quality: $quality }
      ) {
        # ? Optional, as optimisticResponse and subscribeToMore update the cache already
        ...tileSetFragment
      }
    }
    ${TILE_SET_FRAGMENT}
  `,

  properties: ['format', 'quality']
}
