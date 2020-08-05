import {
  InsertOneTileSetDocument,
  UpdateOneTileSetDocument
} from 'src/generated'

export const tile_set = {
  insert: InsertOneTileSetDocument,
  update: UpdateOneTileSetDocument,
  defaults: {
    quality: 100,
    format: 'png'
  }
}
