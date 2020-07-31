import { ItemOptions } from 'src/composables'
import { AreaOfInterest } from 'src/generated'
import subscription from './subscription.graphql'
import insert from './insert.graphql'
import update from './update.graphql'
import list from './list.graphql'

export const AREA_OF_INTEREST_CONFIG: ItemOptions<
  AreaOfInterest,
  'name' | 'source' | 'minZoom' | 'maxZoom'
> = {
  subscription,
  insert,
  update,
  list,
  properties: ['name', 'source', 'minZoom', 'maxZoom']
}
