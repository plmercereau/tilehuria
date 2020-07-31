import { ItemOptions } from 'src/composables'
import {
  AreaOfInterest,
  SelectOneAreaOfInterestDocument,
  InsertAoiDocument,
  UpdateAoiDocument,
  ListAllAreasOfInterestDocument
} from 'src/generated'

export const AREA_OF_INTEREST_CONFIG: ItemOptions<
  AreaOfInterest,
  'name' | 'source' | 'minZoom' | 'maxZoom'
> = {
  subscription: SelectOneAreaOfInterestDocument,
  insert: InsertAoiDocument,
  update: UpdateAoiDocument,
  list: ListAllAreasOfInterestDocument,
  properties: ['name', 'source', 'minZoom', 'maxZoom']
}
