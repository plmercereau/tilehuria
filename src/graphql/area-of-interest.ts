import gql from 'graphql-tag'
import { SingleItemOptions } from 'src/composables'
import { AreaOfInterest } from 'src/generated'

export const AREA_OF_INTEREST_FRAGMENT = gql`
  fragment areaOfInterestFragment on area_of_interest {
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
`

export const AREA_OF_INTEREST_CONFIG: SingleItemOptions<AreaOfInterest> = {
  subscription: gql`
    subscription selectOneAreaOfInterest($id: uuid!) {
      areaOfInterest(id: $id) {
        ...areaOfInterestFragment
      }
    }
    ${AREA_OF_INTEREST_FRAGMENT}
  `,
  insert: gql`
    mutation insertAoi(
      $name: String!
      $source: jsonb!
      $minZoom: Int!
      $maxZoom: Int!
    ) {
      insertAreaOfInterest(object: { name: $name, source: $source }) {
        # ? Optional, as optimisticResponse and subscribeToMore update the cache already
        ...areaOfInterestFragment
      }
    }
    ${AREA_OF_INTEREST_FRAGMENT}
  `,
  update: gql`
    mutation updateAoi(
      $id: uuid!
      $name: String!
      $source: jsonb!
      $minZoom: Int!
      $maxZoom: Int!
    ) {
      updateAreaOfInterest(
        pk_columns: { id: $id }
        _set: {
          name: $name
          source: $source
          minZoom: $minZoom
          maxZoom: $maxZoom
        }
      ) {
        # ? Optional, as optimisticResponse and subscribeToMore update the cache already
        ...areaOfInterestFragment
      }
    }
    ${AREA_OF_INTEREST_FRAGMENT}
  `,
  list: gql`
    query listAllAreasOfInterest {
      areasOfInterest(order_by: { name: asc }) {
        id
        name
        tilesCount
      }
    }
  `,
  properties: ['name', 'source', 'minZoom', 'maxZoom'],
  defaults: ({
    name: '',
    tileSets: [],
    tilesCount: 0,
    minZoom: 1,
    maxZoom: 19
  } as unknown) as AreaOfInterest // TODO do something about it
}
