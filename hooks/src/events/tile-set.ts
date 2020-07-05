import Router from 'koa-router'
import gql from 'graphql-tag'
// TODO 'src/' import won't work!!
import { HasuraEventContext } from '../types'
import { TILE_SET_QUEUE } from '../config'
import { sendMessage } from '../queue'
import { client } from '../graphql-client'
import { TileSet, QueryRoot } from '../generated'

export const tileSet: Router.IMiddleware = async (
  context: HasuraEventContext<TileSet>
) => {
  const id =
    context.request.body?.event.data.new?.id ||
    context.request.body?.event.data.old?.id
  const query = gql`
    query getTileSetProviders($id: uuid!) {
      tileSet(id: $id) {
        format
        quality
        tileProvider {
          slug
          url
        }
        areaOfInterest {
          xyzCoordinates
        }
      }
    }
  `
  const { tileSet } = await client.request<QueryRoot>(query, { id })

  if (tileSet) {
    const {
      format,
      quality,
      tileProvider: { url, slug },
      areaOfInterest: { xyzCoordinates }
    } = tileSet
    sendMessage(
      TILE_SET_QUEUE,
      JSON.stringify({ url, slug, format, quality, xyzCoordinates })
    )
  }
  context.status = 200
}
