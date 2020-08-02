import {
  SelectOneAreaOfInterestDocument,
  InsertAoiDocument,
  UpdateAoiDocument,
  ListAllAreasOfInterestDocument,
  AreaOfInterestFragmentFragment
} from 'src/generated'

export const area_of_interest = {
  subscription: SelectOneAreaOfInterestDocument,
  insert: InsertAoiDocument,
  update: UpdateAoiDocument,
  list: ListAllAreasOfInterestDocument,
  defaults: {
    name: '',
    tilesCount: 0,
    minZoom: 1,
    maxZoom: 20
  } as AreaOfInterestFragmentFragment
}
