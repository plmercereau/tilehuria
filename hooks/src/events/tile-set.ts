import Router from 'koa-router'
import gql from 'graphql-tag'
// TODO 'src/' import won't work!!
import { HasuraEventContext } from '../types'
import { TILE_SET_QUEUE } from '../config'
import { sendMessage } from '../queue'
import { hasuraClient } from '../utils'
import { TileSet, QueryRoot } from '../generated'

export const tileSet: Router.IMiddleware = async (
  context: HasuraEventContext<TileSet>
) => {
  const newTileSet = context.request.body?.event.data.new
  const oldTileSet = context.request.body?.event.data.old
  const id = newTileSet?.id || oldTileSet?.id
  if (
    oldTileSet &&
    newTileSet &&
    oldTileSet.format === newTileSet.format &&
    oldTileSet.quality === newTileSet.quality
  ) {
    console.log(
      ` [*] Updated tileset: ${id}. No changes of quality nor format. Do nothing.`
    )
    return (context.status = 200)
  }
  console.log(
    ` [*] New or updated tileset: ${id}. Relaying the information to the worker...`
  )
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
          name
          userId
          xyzCoordinates
        }
      }
    }
  `
  const { tileSet } = await hasuraClient.request<QueryRoot>(query, { id })

  if (tileSet) {
    const {
      format,
      quality,
      tileProvider: { url, slug },
      areaOfInterest: { name, userId, xyzCoordinates }
    } = tileSet
    console.log('---', userId)
    sendMessage(
      TILE_SET_QUEUE,
      JSON.stringify({
        id,
        name,
        userId,
        url,
        slug,
        format,
        quality,
        xyzCoordinates
      })
    )
  }
  console.log(` [*] Done.`)
  context.status = 200
}
