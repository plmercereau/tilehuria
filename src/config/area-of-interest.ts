import {
  SelectOneAreaOfInterestDocument,
  InsertAoiDocument,
  UpdateAoiDocument,
  ListAllAreasOfInterestDocument,
  AreaOfInterestFragmentFragment as AoiFragment,
  RemoveOneAreaOfInterestDocument
} from 'src/generated'
import { difference, compareByFields } from 'src/utils'

export const area_of_interest = {
  subscription: SelectOneAreaOfInterestDocument,
  insert: InsertAoiDocument,
  update: UpdateAoiDocument,
  list: ListAllAreasOfInterestDocument,
  remove: RemoveOneAreaOfInterestDocument,
  defaults: {
    id: '',
    source: {},
    name: '',
    tilesCount: 0,
    minZoom: 1,
    maxZoom: 20,
    tileSets: [],
    tileSets_aggregate: {
      aggregate: {
        count: 0
      }
    }
  } as AoiFragment,
  dataToVariables: (
    { id, name, maxZoom, minZoom, source, tileSets }: AoiFragment,
    oldItem?: AoiFragment
  ) => {
    // ! For the moment, every tileset that changed is deleted then added again
    const tileSetsRemoveIds = oldItem
      ? difference(oldItem.tileSets, tileSets).map(ts => ts.id)
      : []
    // ! We need to filter the values sent to the graphql mutation (some columns can't be inserted!)
    const tileSetsAdd = (oldItem
      ? difference(tileSets, oldItem.tileSets)
      : tileSets
    ).map(
      ({ id: tsId, areaOfInterestId, format, quality, tileProviderId }) => ({
        id: tsId,
        areaOfInterestId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        tileProviderId,
        format,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        quality
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
  },
  sort: compareByFields(['name'])
}
