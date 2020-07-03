import Router from 'koa-router'
import gql from 'graphql-tag'
// TODO 'src/' import won't work!!

import { HasuraActionContext } from '../../types'
import { client } from '../../graphql-client'
import { geojsonToTiles } from '../../utils'

const updateSourceMutation = gql`
  mutation update_aoi_source(
    $id: uuid!
    $source: jsonb
    $xyzCoordinates: jsonb
  ) {
    updateAreaOfInterest(
      pk_columns: { id: $id }
      _set: { source: $source, xyzCoordinates: $xyzCoordinates }
    ) {
      id
    }
  }
`

const updateName = gql`
  mutation update_aoi_name($id: uuid!, $name: String) {
    updateAreaOfInterest(pk_columns: { id: $id }, _set: { name: $name }) {
      id
    }
  }
`

export const updateAreaOfInterest: Router.IMiddleware = async (
  context: HasuraActionContext<{
    id: string
    source?: GeoJSON.GeoJSON & { name?: string }
    name?: string
  }>
) => {
  if (!context.request.body) throw Error('no body')
  const { id, source, name } = context.request.body.input

  if (source)
    await client.request(updateSourceMutation, {
      id,
      source,
      xyzCoordinates: geojsonToTiles(source)
    })

  if (name)
    await client.request(updateName, {
      id,
      name
    })
  console.log(` [*] Updated the Area of Internet ${id}`)
  // TODO send message on the existing tileSets to the worker (if update)
  // }
  context.status = 200
  context.body = {
    areaOfInterestId: id
  }
}
