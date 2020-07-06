import Router from 'koa-router'
import gql from 'graphql-tag'
// ! Remove this file

import { HasuraEventContext } from '../types'
import { AreaOfInterest, QueryRoot } from '../generated'
import { geojsonToTiles, hasuraClient } from '../utils'
import { MIN_ZOOM, MAX_ZOOM } from '../config'

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
  const { areaOfInterest: aoi } = await hasuraClient.request<QueryRoot>(query, {
    id
  })
  if (aoi) {
    const name = aoi.name || aoi.source.name
    const tiles = aoi.source
      ? geojsonToTiles(aoi.source as GeoJSON.GeoJSON, MIN_ZOOM, MAX_ZOOM)
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
    await hasuraClient.request(mutation, { id, tiles, name })
    console.log(` [*] Done.`)
    // TODO send messages on the existing tileSets to the worker (if any)
  }
  context.status = 200
}
