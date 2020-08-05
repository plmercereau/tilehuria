import {
  SelectOneAreaOfInterestDocument,
  InsertAoiDocument,
  UpdateAoiDocument,
  ListAllAreasOfInterestDocument,
  AreaOfInterestFragmentFragment
} from 'src/generated'
import { difference } from 'src/utils'

export const area_of_interest = {
  subscription: SelectOneAreaOfInterestDocument,
  insert: InsertAoiDocument,
  update: UpdateAoiDocument,
  list: ListAllAreasOfInterestDocument,
  defaults: {
    id: '',
    source: {},
    name: '',
    tilesCount: 0,
    minZoom: 1,
    maxZoom: 20,
    tileSets: []
  } as AreaOfInterestFragmentFragment,
  dataToVariables: (
    {
      id,
      name,
      maxZoom,
      minZoom,
      source,
      tileSets
    }: AreaOfInterestFragmentFragment,
    { tileSets: initialTileSets }: AreaOfInterestFragmentFragment
  ) => {
    // ! For the moment, every tileset that changed is deleted then added again
    const tileSetsRemoveIds = difference(initialTileSets, tileSets).map(
      ts => ts.id
    )
    // ! We need to filter the values sent to the graphql mutation (some columns can't be inserted!)
    const tileSetsAdd = difference(tileSets, initialTileSets).map(
      ({ id: tsId, areaOfInterestId, format, quality, tileProviderId }) => ({
        id: tsId,
        areaOfInterestId,
        tileProviderId: tileProviderId as string,
        format,
        quality: quality as number
      })
    )
    return {
      id,
      name,
      minZoom,
      maxZoom,
      source,
      tileSetsAdd,
      tileSetsRemoveIds
    }
  }
}
