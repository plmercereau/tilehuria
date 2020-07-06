import gql from 'graphql-tag'
import { hasuraClient } from '../utils'

const TILE_SET_PROGRESS = gql`
  mutation updateTileSetProgres($id: uuid!, $progress: Float!) {
    updateTileSet(pk_columns: { id: $id }, _set: { progress: $progress }) {
      id
    }
  }
`

export const updateProgress = async (id: string, progress: number) => {
  await hasuraClient.request(TILE_SET_PROGRESS, { id, progress })
}
