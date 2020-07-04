import Router from 'koa-router'
import gql from 'graphql-tag'
// TODO 'src/' import won't work!!

import { HasuraEventContext } from '../types'
import { client } from '../graphql-client'
import { AreaOfInterest, QueryRoot } from '../generated'
import { geojsonToTiles } from '../utils'
// import { TILE_SET_QUEUE } from '../config'
// import { sendMessage } from '../queue'

export const areaOfInterest: Router.IMiddleware = async (
  context: HasuraEventContext<AreaOfInterest>
) => {
  const id =
    context.request.body?.event.data.new?.id ||
    context.request.body?.event.data.old?.id
  console.log(
    ` [*] Calculating tiles coordinates of the Area of Internet ${id}...`
  )
  const query = gql`
    query getAoiSource($id: uuid!) {
      areaOfInterest(id: $id) {
        source
        name
      }
    }
  `
  const { areaOfInterest: aoi } = await client.request<QueryRoot>(query, {
    id
  })
  if (aoi) {
    const name = aoi.name || aoi.source.name
    const tiles = aoi.source
      ? geojsonToTiles(aoi.source as GeoJSON.GeoJSON)
      : []
    const mutation = gql`
      mutation update_aoi_coordinates(
        $id: uuid!
        $tiles: jsonb!
        $name: String
      ) {
        updateAreaOfInterest(
          pk_columns: { id: $id }
          _set: { xyzCoordinates: $tiles, name: $name }
        ) {
          id
        }
      }
    `
    console.log(` [*] Updating the Area of Internet ${id}...`)
    await client.request(mutation, { id, tiles, name })
    console.log(` [*] Done.`)
    // TODO send messages on the existing tileSets to the worker (if any)
  }
  context.status = 200
}
