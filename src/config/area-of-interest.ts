import {
  AreaOfInterest,
  SelectOneAreaOfInterestDocument,
  InsertAoiDocument,
  UpdateAoiDocument,
  ListAllAreasOfInterestDocument
} from 'src/generated'
import { ItemOptions } from 'src/utils'

export const area_of_interest: ItemOptions<
  AreaOfInterest,
  'name' | 'source' | 'minZoom' | 'maxZoom' | 'tileSets'
> = {
  subscription: SelectOneAreaOfInterestDocument,
  insert: InsertAoiDocument,
  update: UpdateAoiDocument,
  list: ListAllAreasOfInterestDocument,
  properties: ['name', 'source', 'minZoom', 'maxZoom', 'tileSets']
}
