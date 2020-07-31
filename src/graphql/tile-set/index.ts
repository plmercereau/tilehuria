import { ItemOptions } from 'src/composables'
import { TileSet } from 'src/generated'
import insert from './insert.graphql'
import update from './update.graphql'

export const NESTED_TILE_SET_CONFIG: ItemOptions<
  TileSet,
  'format' | 'quality' | 'areaOfInterestId'
> = {
  insert,
  update,

  properties: ['format', 'quality']
}
