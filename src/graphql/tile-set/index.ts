import { ItemOptions } from 'src/composables'
import { TileSet } from 'src/generated'
import insert from './insert.graphql'
import update from './update.graphql'

export const NESTED_TILE_SET_CONFIG: ItemOptions<
  TileSet,
  'format' | 'quality' | 'area_of_interest_id' // TODO underscores
> = {
  insert,
  update,

  properties: ['format', 'quality']
}
