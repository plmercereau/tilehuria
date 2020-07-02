import Router from 'koa-router'
import gql from 'graphql-tag'
// TODO 'src/' import won't work!!

import { HasuraEventContext } from '../types'
import { client } from '../graphql-client'
import { Area_Of_Interest } from '../generated/graphql'
import { geojsonToTiles } from '../utils'
// import { TILE_SET_QUEUE } from '../config'
// import { sendMessage } from '../queue'

export const areaOfInterest: Router.IMiddleware = async (
  context: HasuraEventContext<Area_Of_Interest>
) => {
  const id =
    context.request.body?.event.data.new?.id ||
    context.request.body?.event.data.old?.id
  console.log(
    ` [*] Calculating tiles coordinates of the Area of Internet ${id}...`
  )
  const query = gql`
    query getAoiSource($id: uuid!) {
      areaOfInterestByPk(id: $id) {
        source
      }
    }
  `
  const { areaOfInterestByPk: aoi } = await client.request<{
    areaOfInterestByPk?: Partial<Area_Of_Interest>
  }>(query, { id })
  if (aoi && aoi.source) {
    const tiles = geojsonToTiles(aoi.source)
    const mutation = gql`
      mutation update_aoi_coordinates($id: uuid!, $xyz: jsonb!) {
        updateAreaOfInterestByPk(
          pk_columns: { id: $id }
          _set: { xyzCoordinates: $xyz }
        ) {
          id
        }
      }
    `
    console.log(` [*] Updating the Area of Internet ${id}...`)
    await client.request(mutation, { id, xyz: tiles })
    console.log(` [*] Done.`)
    // TODO send message on the existing tileSets to the worker (if update)
  }
  context.status = 200
}
