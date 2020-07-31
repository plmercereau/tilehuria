import { ItemOptions } from 'src/composables'
import {
  AreaOfInterest,
  SelectOneAreaOfInterest,
  InsertAoi,
  UpdateAoi,
  ListAllAreasOfInterest
} from 'src/generated'

export const AREA_OF_INTEREST_CONFIG: ItemOptions<
  AreaOfInterest,
  'name' | 'source' | 'minZoom' | 'maxZoom'
> = {
  subscription: SelectOneAreaOfInterest,
  insert: InsertAoi,
  update: UpdateAoi,
  list: ListAllAreasOfInterest,
  properties: ['name', 'source', 'minZoom', 'maxZoom']
}
