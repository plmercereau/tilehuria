import { buildASTSchema } from 'graphql'
import gql from 'graphql-tag'

export const schema = buildASTSchema(gql`
  scalar uuid
  type TileSetInfo {
    size: Int
  }
  type Query {
    hello: String
    tileSetInfo(id: uuid!): TileSetInfo
  }
`)
// The root provides a resolver function for each API endpoint
export const rootValue = {
  hello: () => 'Hello world!',
  tileSetInfo: (id: string) => {
    // TODO get the mbTile metadata, and return it :)
    return {
      size: 10
    }
  }
}
